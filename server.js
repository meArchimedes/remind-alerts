const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const Reminder = require("./models/Reminder");
const User = require("./models/User");
const cronJobs = require("./services/cronJobs");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Enable CORS with credentials
const corsOptions = {
  origin: isProduction ? process.env.DOMAIN : "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configure session with cookie settings
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // Keep secure: false since it doesn't work with true
      httpOnly: true,
      sameSite: 'lax', // Use lax for better compatibility
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    // Add this store configuration to persist sessions
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 30 * 24 * 60 * 60, // 30 days
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Set up the Google Strategy
const callbackURL = isProduction
  ? "https://remindalerts.com/auth/google/callback"
  : "/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      proxy: true, // Add this to handle proxied requests correctly
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the DB
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create a new user if one doesn't exist
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
          });
          await user.save();
          console.log("New user created:", user.email);
        } else {
          console.log("Existing user logged in:", user.email);
        }
        return done(null, user);
      } catch (error) {
        console.error("Error in Google auth strategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

mongoose.connect(process.env.MONGO_URI, {
  ssl: true,
});

// Log database connection status
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});

// Debug middleware to log session and auth status
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Is authenticated:", req.isAuthenticated());
  console.log("Session user:", req.session.passport ? req.session.passport.user : 'none');
  console.log("Cookies:", req.headers.cookie);
  next();
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Return JSON response for API requests
  if (req.xhr || req.headers.accept?.includes("application/json")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  // Redirect for browser requests
  res.redirect("/");
}

// Endpoint to check authentication status
app.get("/api/auth/status", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  if (req.isAuthenticated()) {
    return res.status(200).json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
      },
    });
  }

  return res.status(200).json({ isAuthenticated: false });
});

// Endpoint to get all events for a user
app.get("/api/user-events", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const reminders = await Reminder.find({ user: userId });
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Endpoint to add a new event
app.post("/api/add-event", isLoggedIn, async (req, res) => {
  const {
    eventType,
    eventName,
    eventDate,
    eventTime,
    reminderType,
    isRecurringEvent = false,
    recurringFrequency,
    notes,
  } = req.body;

  let formattedDate;

  if (isRecurringEvent && recurringFrequency) {
    // Handle different recurring frequencies
    if (recurringFrequency === "weekly") {
      // For weekly events, store the day of week (e.g., "Monday")
      formattedDate = eventDate; // Already contains day of week
    } else if (recurringFrequency === "monthly") {
      // For monthly events, store the day of month (e.g., "15")
      formattedDate = eventDate; // Already contains day of month
    } else if (
      recurringFrequency === "yearly" ||
      eventType === "birthday" ||
      eventType === "anniversary"
    ) {
      // For yearly events, format as MM/DD
      const [month, day] = eventDate.split("/");
      formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
    }
  } else {
    formattedDate = eventDate;
  }

  const newReminder = new Reminder({
    userEmail: req.user.email,
    eventType,
    eventName,
    eventDate: formattedDate.toString(),
    eventTime,
    reminderType,
    isRecurringEvent,
    recurringFrequency: recurringFrequency || null,
    notes,
    user: req.user._id,
    lastSent: undefined,
  });

  try {
    await newReminder.save();
    res.status(200).json({ message: "Event added successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error adding event" });
  }
});

// Edit an event
app.put("/api/edit-event/:id", isLoggedIn, async (req, res) => {
  const eventId = req.params.id; // Event ID from URL params
  const {
    eventType,
    eventName,
    eventDate,
    reminderType,
    isRecurringEvent = false,
    recurringFrequency,
    eventTime,
    notes,
  } = req.body; // Updated event details

  try {
    // Find the event and ensure it belongs to the logged-in user
    const event = await Reminder.findOne({ _id: eventId, user: req.user._id });

    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or not authorized" });
    }

    event.eventType = eventType || event.eventType;
    event.eventName = eventName || event.eventName;
    event.isRecurringEvent = isRecurringEvent;
    event.recurringFrequency = recurringFrequency || event.recurringFrequency;

    // Format date based on recurring frequency
    if (eventDate) {
      let formattedDate;

      if (isRecurringEvent && recurringFrequency) {
        // Handle different recurring frequencies
        if (recurringFrequency === "weekly") {
          // For weekly events, store the day of week (e.g., "Monday")
          formattedDate = eventDate; // Already contains day of week
        } else if (recurringFrequency === "monthly") {
          // For monthly events, store the day of month (e.g., "15")
          formattedDate = eventDate; // Already contains day of month
        } else if (
          recurringFrequency === "yearly" ||
          eventType === "birthday" ||
          eventType === "anniversary"
        ) {
          // For yearly events, format as MM/DD
          const [month, day] = eventDate.split("/");
          formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
        }
      } else {
        formattedDate = eventDate;
      }

      event.eventDate = formattedDate;
    }

    event.notes = notes || "";
    event.eventTime = eventTime || "";
    event.reminderType = reminderType || event.reminderType;
    event.lastSent = undefined;

    await event.save();

    res.status(200).json({ message: "Event updated successfully!" });
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the event" });
  }
});

// Delete event
app.delete("/api/delete-event", isLoggedIn, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Event ID is required" });
  }
  try {
    const deletedEvent = await Reminder.deleteOne({
      _id: id,
      user: req.user._id,
    });

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res
      .status(200)
      .json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Auth Routes
app.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Starting Google auth flow");
    next();
  },
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Google callback route
app.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("Google auth callback received");
    next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Google auth successful, redirecting to dashboard");
    // Force session save before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
      res.redirect("/dashboard");
    });
  }
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Error during logout" });
    }
    res.redirect("/");
  });
});

// Dashboard route
app.get(
  "/dashboard",
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthenticated user tried to access dashboard");
      return res.redirect("/");
    }
    console.log("User accessing dashboard:", req.user.email);
    next();
  },
  (req, res) => {
    const indexPath = path.join(__dirname, "dist", "index.html");
    res.sendFile(indexPath);
  }
);

// Root route
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Authenticated user at root, redirecting to dashboard");
    return res.redirect("/dashboard");
  }
  console.log("Serving login page");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Import and run the cron jobs
require("./services/cronJobs");

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});