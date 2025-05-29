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

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Enable CORS with credentials
const corsOptions = {
  origin: isProduction 
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
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to false to work with both HTTP and HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Log the callback URL being used
const callbackURL = "/auth/google/callback";
console.log("Google OAuth callback URL:", isProduction 
  ? `${process.env.DOMAIN}${callbackURL}` 
  : `http://localhost:4000${callbackURL}`);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      proxy: true // Add this to handle proxied requests correctly
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile.id, profile.displayName);
        // Check if the user already exists in the DB
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create a new user if one doesn't exist
          console.log("Creating new user:", profile.displayName);
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
          });
          await user.save();
        } else {
          console.log("Existing user found:", user.displayName);
        }
        return done(null, user);
      } catch (error) {
        console.error("Error in Google strategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log("Deserialized user:", user ? user.displayName : "not found");
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
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB successfully.");
});

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Debug middleware to log session and auth status
app.use((req, res, next) => {
  console.log("Path:", req.path);
  console.log("Session ID:", req.sessionID);
  console.log("Is authenticated:", req.isAuthenticated());
  console.log("User:", req.user ? `${req.user.displayName} (${req.user.email})` : "not logged in");
  next();
});

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
  (req, res, next) => {
    console.log("Auth request received, redirecting to Google");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/logout", (req, res) => {
  console.log("Logging out user:", req.user ? req.user.displayName : "unknown");
  req.logout(() => {
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  console.log("Unauthorized access attempt");
  
  // Return JSON response for API requests
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'Unauthorized', redirectTo: '/' });
  }
  
  // Redirect for browser requests
  res.redirect("/");
}

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("Google callback received");
    next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Authentication successful, redirecting to dashboard");
    res.redirect("/");
  }
);

// Copy bell.png to public/assets if it doesn't exist
const publicAssetsDir = path.join(__dirname, 'public', 'assets');
const bellPngPath = path.join(publicAssetsDir, 'bell.png');

// Ensure the directory exists
if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}

// Copy bell.png from assets to public/assets if it doesn't exist
if (!fs.existsSync(bellPngPath)) {
  try {
    const assetsDir = path.join(__dirname, 'assets');
    if (fs.existsSync(path.join(assetsDir, 'bell.png'))) {
      fs.copyFileSync(
        path.join(assetsDir, 'bell.png'),
        bellPngPath
      );
      console.log('Copied bell.png to public/assets');
    }
  } catch (err) {
    console.error('Error copying bell.png:', err);
  }
}

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Import and run the cron jobs
require("./services/cronJobs");

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Domain: ${process.env.DOMAIN || 'http://localhost:4000'}`);
});