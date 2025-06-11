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

// Configure session with cookie settings - UPDATED
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    // Add this store configuration to persist sessions
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 30 * 24 * 60 * 60, // 14 days
      // autoRemove: "native", // Removes expired sessions
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from both public and dist directories
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));

// Log the callback URL being used
const callbackURL = "/auth/google/callback";

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
        } else {
        }
        return done(null, user);
      } catch (error) {
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

// Log database connection success or error
mongoose.connection.on("connected", () => {});

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});

// Debug middleware to log session and auth status
// app.use((req, res, next) => {

//   next();
// });

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
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Return JSON response for API requests
  if (req.xhr || req.headers.accept?.includes("application/json")) {
    return res.status(401).json({ error: "Unauthorized", redirectTo: "/" });
  }

  // Redirect for browser requests
  res.redirect("/");
}

// UPDATED Google callback route
app.get(
  "/auth/google/callback",
  (req, res, next) => {
    next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Copy bell.png to public/assets if it doesn't exist
const publicAssetsDir = path.join(__dirname, "public", "assets");
const bellPngPath = path.join(publicAssetsDir, "bell.png");

// Ensure the directory exists
if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}

// Copy bell.png from assets to public/assets if it doesn't exist
if (!fs.existsSync(bellPngPath)) {
  try {
    const assetsDir = path.join(__dirname, "assets");
    if (fs.existsSync(path.join(assetsDir, "bell.png"))) {
      fs.copyFileSync(path.join(assetsDir, "bell.png"), bellPngPath);
    }
  } catch (err) {
    console.error("Error copying bell.png:", err);
  }
}

// UPDATED Dashboard route with debug logging
app.get(
  "/dashboard",
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/");
    }

    next();
  },
  (req, res) => {
    const indexPath = path.join(__dirname, "dist", "index.html");
    res.sendFile(indexPath);
  }
);

app.get("/", (req, res) => {
  // If user is already authenticated, redirect to dashboard
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  // Otherwise serve the login page
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  }
});

// Import and run the cron jobs
require("./services/cronJobs");

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
