// import React, { useState } from "react";
// import DateInput from "./dateInput";
// import "react-datepicker/dist/react-datepicker.css";

// const AddEventForm = ({ onSubmit }) => {
//   const [eventType, setEventType] = useState("");
//   const [isRecurringEvent, setIsRecurringEvent] = useState(
//     eventType === "birthday" || eventType === "anniversary"
//   );
//   const [recurringFrequency, setRecurringFrequency] = useState("yearly");

//   const [eventName, setEventName] = useState("");
//   const [eventDate, setEventDate] = useState();
//   const [eventTime, setEventTime] = useState("");
//   const [reminderType, setReminderType] = useState("");
//   const [notes, setNotes] = useState("");

//   const valid = !!eventType && !!eventName && !!eventDate && !!reminderType;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({
//       eventType,
//       eventName,
//       eventDate,
//       eventTime,
//       reminderType,
//       isRecurring:
//         eventType === "other"
//           ? isRecurringEvent
//           : eventType === "birthday" || eventType === "anniversary",
//       recurringFrequency:
//         eventType === "other" && isRecurring
//           ? recurringFrequency
//           : eventType === "birthday" || eventType === "anniversary"
//           ? "yearly"
//           : null,
//       notes,
//     });
//     setEventType("");
//     setIsRecurringEvent(false);
//     setEventName("");
//     setEventDate();
//     setEventTime("");
//     setNotes("");
//     setReminderType("");
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg"
//     >
//       <h2 className="text-xl font-bold mb-4">Add Event</h2>

//       <label className="block mb-2">
//         <span className="text-gray-700">Event Type:</span>
//         <select
//           value={eventType}
//           onChange={(e) => setEventType(e.target.value)}
//           required
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         >
//           <option value="" disabled>
//             Select event type
//           </option>
//           <option value="birthday">Birthday</option>
//           <option value="anniversary">Anniversary</option>
//           <option value="appointment">Appointment</option>
//           <option value="other">Other</option>
//         </select>
//       </label>

//       <label className="block mb-2">
//         <span className="text-gray-700">Event Name:</span>
//         <input
//           type="text"
//           value={eventName}
//           onChange={(e) => setEventName(e.target.value)}
//           placeholder="Event name"
//           required
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         />
//       </label>

//       <label className="block mb-2">
//         <span className="text-gray-700">Event Date:</span>
//         <div className="w-full p-2 border border-gray-300 rounded-lg">
//           <DateInput
//             eventDate={eventDate}
//             setEventDate={setEventDate}
//             isRecurringEvent={isRecurringEvent}
//           />
//         </div>
//       </label>

//       {eventType && eventType === "other" && (
//         <div className="mb-2">
//           <label className="flex items-center mb-2">
//             <input
//               type="checkbox"
//               checked={isRecurring}
//               onChange={(e) => setIsRecurring(e.target.checked)}
//               className="mr-2"
//             />
//             <span className="text-gray-700">Recurring event</span>
//           </label>

//           {isRecurring && (
//             <div className="ml-6 mt-2">
//               <label className="block">
//                 <span className="text-gray-700">Frequency:</span>
//                 <select
//                   value={recurringFrequency}
//                   onChange={(e) => setRecurringFrequency(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-lg mt-1"
//                 >
//                   <option value="yearly">Yearly</option>
//                   <option value="monthly">Monthly</option>
//                   <option value="weekly">Weekly</option>
//                 </select>
//               </label>
//             </div>
//           )}
//         </div>
//       )}

//       {!isRecurringEvent && (
//         <label className="block mb-2">
//           <span className="text-gray-700">Event Time:</span>
//           <input
//             type="time"
//             value={eventTime}
//             onChange={(e) => setEventTime(e.target.value)}
//             placeholder="Event time"
//             className="w-full p-2 border border-gray-300 rounded-lg"
//           />
//         </label>
//       )}

//       <label className="block mb-2">
//         <span className="text-gray-700">Reminder Type:</span>
//         <select
//           value={reminderType}
//           onChange={(e) => setReminderType(e.target.value)}
//           required
//           className="w-full p-2 border border-gray-300 rounded-lg"
//         >
//           <option value="" disabled>
//             Select reminder type
//           </option>
//           <option value="day_before">Day Before Only</option>
//           <option value="day_before_and_day_of">Day Before and Day Of</option>
//           <option value="day_of">Day Of Only</option>
//         </select>
//       </label>
//       <label className="block mb-3">
//         <span className="text-gray-700">Notes:</span>
//         <textarea
//           className="w-full p-2 border border-gray-300 rounded-lg"
//           value={notes}
//           onInput={(e) => setNotes(e.target.value)}
//         />
//       </label>

//       <button
//         type="submit"
//         disabled={!valid}
//         className={`w-full p-2 mt-4 ${
//           valid ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-200"
//         } rounded-lg hover:${
//           valid ? "bg-blue-600" : "bg-gray-500"
//         } transition duration-200`}
//       >
//         Add Event
//       </button>
//     </form>
//   );
// };

// export default AddEventForm;

import React, { useState, useEffect } from "react";
import DateInput from "./dateInput";
import "react-datepicker/dist/react-datepicker.css";

const AddEventForm = ({ onSubmit }) => {
  const [eventType, setEventType] = useState("");
  const [isRecurringEvent, setIsRecurringEvent] = useState(false);

  // Update isRecurringEvent when eventType changes
  useEffect(() => {
    if (eventType === "birthday" || eventType === "anniversary") {
      setIsRecurringEvent(true);
      setRecurringFrequency("yearly");
    } else if (eventType === "other") {
      setIsRecurringEvent(false);
    }
  }, [eventType]);
  const [recurringFrequency, setRecurringFrequency] = useState("yearly");
  const [weeklyDay, setWeeklyDay] = useState("Monday");
  const [monthlyDay, setMonthlyDay] = useState("1");

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState();
  const [eventTime, setEventTime] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [notes, setNotes] = useState("");

  // Update validation to check for appropriate date field
  const valid = !!eventType && !!eventName && 
    (recurringFrequency === "weekly" && isRecurringEvent ? !!weeklyDay : 
     recurringFrequency === "monthly" && isRecurringEvent ? !!monthlyDay : 
     !!eventDate) && 
    !!reminderType;

  // Reset date fields when frequency changes
  useEffect(() => {
    if (recurringFrequency === "weekly" || recurringFrequency === "monthly") {
      setEventDate(undefined);
    }
  }, [recurringFrequency]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the date based on frequency
    let formattedDate;
    if (recurringFrequency === "weekly" && isRecurringEvent) {
      formattedDate = weeklyDay;
    } else if (recurringFrequency === "monthly" && isRecurringEvent) {
      formattedDate = monthlyDay;
    } else {
      formattedDate = eventDate;
    }
    
    onSubmit({
      eventType,
      eventName,
      eventDate: formattedDate,
      eventTime,
      reminderType,
      isRecurring:
        eventType === "other"
          ? isRecurringEvent
          : eventType === "birthday" || eventType === "anniversary",
      recurringFrequency:
        eventType === "other" && isRecurringEvent
          ? recurringFrequency
          : eventType === "birthday" || eventType === "anniversary"
          ? "yearly"
          : null,
      notes,
    });
    
    setEventType("");
    setIsRecurringEvent(false);
    setEventName("");
    setEventDate();
    setEventTime("");
    setNotes("");
    setReminderType("");
    setWeeklyDay("Monday");
    setMonthlyDay("1");
  };

  // Render date input based on frequency
  const renderDateInput = () => {
    if (isRecurringEvent) {
      if (recurringFrequency === "weekly") {
        return (
          <label className="block mb-2">
            <span className="text-gray-700">Select a day of the Week:</span>
            <select
              value={weeklyDay}
              onChange={(e) => setWeeklyDay(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </label>
        );
      } else if (recurringFrequency === "monthly") {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        return (
          <label className="block mb-2">
            <span className="text-gray-700">Select a day of the Month:</span>
            <select
              value={monthlyDay}
              onChange={(e) => setMonthlyDay(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {days.map(day => (
                <option key={day} value={day.toString()}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        );
      } else if (recurringFrequency === "yearly") {
        // For yearly events (birthdays, anniversaries), use MM/DD format
        return (
          <label className="block mb-2">
            <span className="text-gray-700">
              {eventType === "birthday" ? "Birthday Date (MM/DD):" : 
               eventType === "anniversary" ? "Anniversary Date (MM/DD):" : 
               "Event Date (MM/DD):"}
            </span>
            <div className="w-full p-2 border border-gray-300 rounded-lg">
              <DateInput
                eventDate={eventDate}
                setEventDate={setEventDate}
                isRecurringEvent={true}
              />
            </div>
          </label>
        );
      }
    }
    
    // Default date picker for non-recurring events
    return (
      <label className="block mb-2">
        <span className="text-gray-700">Event Date:</span>
        <div className="w-full p-2 border border-gray-300 rounded-lg">
          <DateInput
            eventDate={eventDate}
            setEventDate={setEventDate}
            isRecurringEvent={false}
          />
        </div>
      </label>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg"
    >
      <h2 className="text-xl font-bold mb-4">Add Event</h2>

      <label className="block mb-2">
        <span className="text-gray-700">Event Type:</span>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="" disabled>
            Select event type
          </option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
          <option value="appointment">Appointment</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block mb-2">
        <span className="text-gray-700">Event Name:</span>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event name"
          required
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </label>

      {eventType === "birthday" && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-600">✓ This is a yearly recurring event</span>
        </div>
      )}

      {eventType === "anniversary" && (
        <div className="mb-2 p-2 bg-pink-50 rounded-lg">
          <span className="text-sm text-pink-600">✓ This is a yearly recurring event</span>
        </div>
      )}

      {eventType && eventType === "other" && (
        <div className="mb-2">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={isRecurringEvent}
              onChange={(e) => setIsRecurringEvent(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700">Recurring event</span>
          </label>

          {isRecurringEvent && (
            <div className="ml-6 mt-2">
              <label className="block">
                <span className="text-gray-700">Frequency:</span>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                >
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      {renderDateInput()}

      {!isRecurringEvent && (
        <label className="block mb-2">
          <span className="text-gray-700">Event Time:</span>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            placeholder="Event time"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </label>
      )}

      <label className="block mb-2">
        <span className="text-gray-700">Reminder Type:</span>
        <select
          value={reminderType}
          onChange={(e) => setReminderType(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="" disabled>
            Select reminder type
          </option>
          <option value="day_before">Day Before Only</option>
          <option value="day_before_and_day_of">Day Before and Day Of</option>
          <option value="day_of">Day Of Only</option>
        </select>
      </label>
      <label className="block mb-3">
        <span className="text-gray-700">Notes:</span>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={notes}
          onInput={(e) => setNotes(e.target.value)}
        />
      </label>

      <button
        type="submit"
        disabled={!valid}
        className={`w-full p-2 mt-4 ${
          valid ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-200"
        } rounded-lg hover:${
          valid ? "bg-blue-600" : "bg-gray-500"
        } transition duration-200`}
      >
        Add Event
      </button>
    </form>
  );
};

export default AddEventForm;
