import React, { useState, useEffect } from "react";
import DateInput from "./dateInput";
import axios from "axios";

function EditEventForm({
  editedEvent,
  editingEvent,
  setEditedEvent,
  setEditingEvent,
  fetchEvents,
}) {
  const [weeklyDay, setWeeklyDay] = useState("Monday");
  const [monthlyDay, setMonthlyDay] = useState("1");

  // Initialize recurring event state based on editedEvent
  useEffect(() => {
    if (editedEvent.recurringFrequency === "weekly" && editedEvent.eventDate) {
      setWeeklyDay(editedEvent.eventDate);
    } else if (
      editedEvent.recurringFrequency === "monthly" &&
      editedEvent.eventDate
    ) {
      setMonthlyDay(editedEvent.eventDate);
    }
  }, [editedEvent]);

  // Cancel edit mode
  const handleCancel = () => {
    setEditingEvent(null);
  };

  const handleSave = async () => {
    // Format date based on recurring frequency
    let formattedEventDate = editedEvent.eventDate;

    if (editedEvent.isRecurringEvent && editedEvent.recurringFrequency) {
      if (editedEvent.recurringFrequency === "weekly") {
        formattedEventDate = weeklyDay;
      } else if (editedEvent.recurringFrequency === "monthly") {
        formattedEventDate = monthlyDay;
      }
    }

    try {
      await axios.put(`/api/edit-event/${editingEvent}`, {
        ...editedEvent,
        eventDate: formattedEventDate,
      });
      setEditingEvent(null);
      setEditedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  // Render date input based on frequency
  const renderDateInput = () => {
    const isRecurringEvent =
      editedEvent.eventType === "birthday" ||
      editedEvent.eventType === "anniversary" ||
      editedEvent.isRecurringEvent;

    if (isRecurringEvent && editedEvent.recurringFrequency) {
      if (editedEvent.recurringFrequency === "weekly") {
        return (
          <>
            <label className="block mb-2">
              <span className="text-gray-700">Select a day of the Week:</span>
            </label>
            <select
              value={weeklyDay}
              onChange={(e) => {
                setWeeklyDay(e.target.value);
                setEditedEvent({
                  ...editedEvent,
                  eventDate: e.target.value,
                });
              }}
              className="mb-2 border rounded-md p-2"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </>
        );
      } else if (editedEvent.recurringFrequency === "monthly") {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        return (
          <>
            <label className="block mb-2">
              <span className="text-gray-700">Select a day of the month:</span>
            </label>
            <select
              value={monthlyDay}
              onChange={(e) => {
                setMonthlyDay(e.target.value);
                setEditedEvent({
                  ...editedEvent,
                  eventDate: e.target.value,
                });
              }}
              className="mb-2 border rounded-md p-2"
            >
              {days.map((day) => (
                <option key={day} value={day.toString()}>
                  {day}
                </option>
              ))}
            </select>
          </>
        );
      }
    }

    // Default date picker for yearly events and non-recurring events
    return (
      <DateInput
        eventType={editedEvent.eventType}
        editedEvent={editedEvent}
        setEditedEvent={setEditedEvent}
        isRecurringEvent={
          editedEvent.eventType === "birthday" ||
          editedEvent.eventType === "anniversary" ||
          (editedEvent.eventType === "other" &&
            editedEvent.isRecurringEvent &&
            editedEvent.recurringFrequency === "yearly")
        }
      />
    );
  };

  return (
    <div className="flex flex-col w-full">
      <input
        type="text"
        value={editedEvent.eventName || ""}
        onChange={(e) =>
          setEditedEvent({
            ...editedEvent,
            eventName: e.target.value,
          })
        }
        className="mb-2 border rounded-md p-2"
        placeholder="Event Name"
      />
      <select
        value={editedEvent.eventType || ""}
        onChange={(e) =>
          setEditedEvent({
            ...editedEvent,
            eventType: e.target.value,
            isRecurringEvent:
              e.target.value === "birthday" ||
              e.target.value === "anniversary" ||
              editedEvent.isRecurringEvent,
          })
        }
        className="mb-2 border rounded-md p-2"
      >
        <option value="birthday">Birthday</option>
        <option value="anniversary">Anniversary</option>
        <option value="appointment">Appointment</option>
        <option value="other">Other</option>
      </select>

      {editedEvent.eventType === "other" && (
        <div className="mb-2">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={editedEvent.isRecurringEvent || false}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  isRecurringEvent: e.target.checked,
                })
              }
              className="mr-2"
            />
            <span>Recurring event</span>
          </label>

          {editedEvent.isRecurringEvent && (
            <select
              value={editedEvent.recurringFrequency || "yearly"}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  recurringFrequency: e.target.value,
                })
              }
              className="mb-2 border rounded-md p-2 w-full"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          )}
        </div>
      )}

      <div className="mb-2 border rounded-md p-2">{renderDateInput()}</div>

      {(!editedEvent.isRecurringEvent ||
        editedEvent.recurringFrequency === "yearly" ||
        editedEvent.eventType === "appointment") && (
        <input
          type="time"
          value={editedEvent.eventTime || ""}
          onChange={(e) => {
            setEditedEvent({
              ...editedEvent,
              eventTime: e.target.value,
            });
          }}
          className="mb-2 border rounded-md p-2"
          placeholder="Event Time"
        />
      )}

      <span>Reminder Type:</span>
      <select
        value={editedEvent.reminderType}
        onChange={(e) =>
          setEditedEvent({
            ...editedEvent,
            reminderType: e.target.value,
          })
        }
        required
        className="mb-2 border rounded-md p-2"
      >
        <option value="" disabled>
          Select reminder type
        </option>
        <option value="day_before">Day Before Only</option>
        <option value="day_before_and_day_of">Day Before and Day Of</option>
        <option value="day_of">Day Of Only</option>
      </select>

      <textarea
        value={editedEvent.notes || ""}
        onChange={(e) =>
          setEditedEvent({
            ...editedEvent,
            notes: e.target.value,
          })
        }
        className="mb-2 border rounded-md p-2"
        placeholder="Notes (optional)"
        rows={3}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditEventForm;
