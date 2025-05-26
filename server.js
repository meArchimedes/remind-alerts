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
require("dotenv").config();

const app = express();

// Enable CORS with credentials
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.DOMAIN 
    : "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configure session with cookie settings
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
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
    done(error, null);
  }
});

mongoose.connect(process.env.MONGO_URI, {
  ssl: true,
});

// Log database connection success or error
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB successfully.");
});

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Endpoint to check authentication status
app.get("/api/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName
      }
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
  const { eventType, eventName, eventDate, eventTime, reminderType, notes } =
    req.body;
  let formattedDate;
  if (eventType === "birthday" || eventType === "anniversary") {
    const [month, day] = eventDate.split("/");
    formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
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
    notes,
    user: req.user._id,
    lastSent: undefined,
  });
  try {
    await newReminder.save();
    res.status(200).json({ message: "Event added successfully!" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Error adding event" });
  }
});

// Edit an event
app.put("/api/edit-event/:id", isLoggedIn, async (req, res) => {
  const eventId = req.params.id; // Event ID from URL params
  const { eventType, eventName, eventDate, reminderType, eventTime, notes } =
    req.body; // Updated event details

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
    event.eventDate = eventDate || event.eventDate;
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
    const deletedEvent = await Reminder.deleteOne({ _id: id, user: req.user._id });

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
  passport.authenticate("google", { scope: ["profile", "email"] })
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
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'Unauthorized', redirectTo: '/' });
  }
  
  // Redirect for browser requests
  res.redirect("/");
}

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Redirect to the dashboard after successful authentication
    if (process.env.NODE_ENV === 'production') {
      res.redirect('/dashboard');
    } else {
      res.redirect("http://localhost:3000/dashboard");
    }
  }
);

// In production, serve static files and handle routes
if (process.env.NODE_ENV === 'production') {
  // Serve the simple index.html for the root route
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  // For dashboard route, check if authenticated
  app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
      res.sendFile(path.join(__dirname, 'dashboard.html'));
    } else {
      res.redirect('/');
    }
  });
  
  // For all other routes
  app.get('*', (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  });
}

// Import and run the cron jobs
require("./services/cronJobs");

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});