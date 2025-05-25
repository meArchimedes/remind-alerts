const fs = require("fs");
const path = require("path");

// Get the appropriate email template based on event type
const getEmailTemplate = (eventType) => {
  let templatePath;
  
  switch(eventType.toLowerCase()) {
    case 'birthday':
      templatePath = path.join(__dirname, "../emails/birthdayTemplate.html");
      break;
    case 'anniversary':
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
    return fs.readFileSync(path.join(__dirname, "../emails/defaultTemplate.html"), "utf-8");
  }
};

// Get appropriate email subject based on event type
const getEmailSubject = (eventType, eventName) => {
  switch(eventType.toLowerCase()) {
    case 'birthday':
      return `🎂 Birthday Reminder: ${eventName}`;
    case 'anniversary':
      return `💍 Anniversary Reminder: ${eventName}`;
    default:
      return `📅 Event Reminder: ${eventName}`;
  }
};

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

module.exports = {
  getEmailTemplate,
  getEmailSubject,
  shouldSendToday
};