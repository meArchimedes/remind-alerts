import React, { useState } from "react";
import DateInput from "./dateInput";
import "react-datepicker/dist/react-datepicker.css";

const AddEventForm = ({ onSubmit }) => {
  const [eventType, setEventType] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState();
  const [eventTime, setEventTime] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [notes, setNotes] = useState("");
  const isRecurringEvent =
    eventType === "birthday" || eventType === "anniversary";
  const valid = !!eventType && !!eventName && !!eventDate && !!reminderType;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ eventType, eventName, eventDate, eventTime, reminderType, notes });
    setEventType("");
    setEventName("");
    setEventDate();
    setEventTime("");
    setNotes("");
    setReminderType("");
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

      <label className="block mb-2">
        <span className="text-gray-700">Event Date:</span>
        <div className="w-full p-2 border border-gray-300 rounded-lg">
          <DateInput
            eventDate={eventDate}
            setEventDate={setEventDate}
            isRecurringEvent={isRecurringEvent}
          />
        </div>
      </label>

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
