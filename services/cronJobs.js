const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const sendReminderEmail = require("../utils/sendReminderEmail");
const fs = require("fs");
const path = require("path");

const formatDateMMDD = (date) =>
  `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate()
  ).padStart(2, "0")}`;

const formatDateYYYYMMDD = (date) => date.toISOString().split("T")[0];

// Get the appropriate email template based on event type
const getEmailTemplate = (eventType) => {
  let templatePath;

  switch (eventType.toLowerCase()) {
    case "birthday":
      templatePath = path.join(__dirname, "../emails/birthdayTemplate.html");
      break;
    case "anniversary":
      templatePath = path.join(__dirname, "../emails/anniversaryTemplate.html");
      break;
    default:
      templatePath = path.join(__dirname, "../emails/defaultTemplate.html");
  }

  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    console.error(`Error reading template for ${eventType}:`, error);
    // Fallback to default template if specific template fails
    return fs.readFileSync(
      path.join(__dirname, "../emails/defaultTemplate.html"),
      "utf-8"
    );
  }
};

// Get appropriate email subject based on event type
const getEmailSubject = (eventType, eventName) => {
  switch (eventType.toLowerCase()) {
    case "birthday":
      return `🎂 Birthday Reminder: ${eventName}`;
    case "anniversary":
      return `💍 Anniversary Reminder: ${eventName}`;
    default:
      return `📅 Event Reminder: ${eventName}`;
  }
};

// Set different schedule for production vs development
const schedule =
  process.env.NODE_ENV === "production"
    ? "0 8,16 * * *" // Twice a day at 8 AM and 4 PM in production
    : "* * * * *"; // Every minute in development


cron.schedule(schedule, async () => {

  try {
   const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Create a date object for the start of today (midnight)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const todayMMDD = formatDateMMDD(now);
    const tomorrowMMDD = formatDateMMDD(tomorrow);
    const todayYYYYMMDD = formatDateYYYYMMDD(now);
    const tomorrowYYYYMMDD = formatDateYYYYMMDD(tomorrow);

    // Fetch reminders and populate user emails
    const reminders = await Reminder.find({
      eventDate: {
        $in: [todayMMDD, tomorrowMMDD, todayYYYYMMDD, tomorrowYYYYMMDD],
      },
      $or: [
        { lastSent: { $exists: false } },
        { lastSent: { $lt: today } },
      ],
    }).populate("user", "email");

    if (reminders.length === 0) {
      return;
    }


    for (reminder of reminders) {
      if (!reminder.user || !reminder.user.email) {
        console.warn(
          `Skipping reminder ${reminder._id}: User email not found.`
        );
        continue;
      }

      if (
        shouldSendToday(
          reminder,
          todayYYYYMMDD,
          tomorrowYYYYMMDD,
          todayMMDD,
          tomorrowMMDD
        )
      ) {
        const userEmail = reminder.user.email;

        // Get the appropriate template based on event type
        const htmlTemplate = getEmailTemplate(reminder.eventType);

        // Prepare email content
        const emailContent = htmlTemplate
          .replace(
            "{{logoUrl}}",
            process.env.DOMAIN
              ? `${process.env.DOMAIN}/assets/bell.png`
              : "http://localhost:3000/assets/bell.png"
          )
          .replace("{{eventName}}", reminder.eventName)
          .replace("{{eventDate}}", reminder.eventDate)
          .replace("{{eventType}}", reminder.eventType)
          .replace(/\{\{\s*eventTime\s*\}\}/g, reminder.eventTime || "")
          .replace("{{appUrl}}", process.env.DOMAIN || "http://localhost:3000");

        // Get appropriate subject
        const emailSubject = getEmailSubject(
          reminder.eventType,
          reminder.eventName
        );

        const emailSent = await sendReminderEmail(
          userEmail,
          emailSubject,
          emailContent
        );

        if (emailSent) {
          // Check if this is a non-recurring appointment or other event that should be deleted
          if (
            (reminder.eventType === "appointment" ||
              (reminder.eventType === "other" && !reminder.isRecurringEvent)) &&
            (reminder.reminderType === "day_of" || reminder.reminderType === "both") &&
            (reminder.eventDate === todayYYYYMMDD || reminder.eventDate === todayMMDD)
          ) {
          
            await Reminder.findByIdAndDelete(reminder._id);
          } else {
            // Just update the lastSent field for recurring events
            reminder.lastSent = new Date();
            await reminder.save();
          }
        }
      }
    }

  } catch (error) {
    console.error("Error processing reminders:", error);
  }
});

// Function to determine if the reminder should be sent today
function shouldSendToday(
  reminder,
  todayYYYYMMDD,
  tomorrowYYYYMMDD,
  todayMMDD,
  tomorrowMMDD
) {
  const eventDate = reminder.eventDate;
  const { reminderType } = reminder;

  return (
    (reminderType === "day_of" &&
      (eventDate === todayYYYYMMDD || eventDate === todayMMDD)) ||
    (reminderType === "day_before" &&
      (eventDate === tomorrowYYYYMMDD || eventDate === tomorrowMMDD)) ||
    (reminderType === "both" &&
      (eventDate === todayYYYYMMDD ||
        eventDate === tomorrowYYYYMMDD ||
        eventDate === todayMMDD ||
        eventDate === tomorrowMMDD))
  );
}
