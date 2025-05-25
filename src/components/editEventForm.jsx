import React from "react";
import DateInput from "./dateInput";
import axios from "axios";

function EditEventForm({
  editedEvent,
  editingEvent,
  setEditedEvent,
  setEditingEvent,
  fetchEvents,
}) {
  // Cancel edit mode
  const handleCancel = () => {
    setEditingEvent(null);
  };
  const handleSave = async () => {
    try {
      await axios.put(`/api/edit-event/${editingEvent}`, editedEvent);
      setEditingEvent(null);
      setEditedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
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
          })
        }
        className="mb-2 border rounded-md p-2"
      >
        <option value="bday">Birthday</option>
        <option value="anniversary">Anniversary</option>
        <option value="appointment">Appointment</option>
        <option value="other">Other</option>
      </select>
      <div className="mb-2 border rounded-md p-2">
        <DateInput
          eventType={editedEvent.eventType}
          editedEvent={editedEvent}
          setEditedEvent={setEditedEvent}
          isRecurringEvent={
            editedEvent.eventType === "birthday" ||
            editedEvent.eventType === "anniversary"
          }
        />
      </div>
      {(editedEvent.eventType === "appointment" ||
        editedEvent.eventType === "other") && (
        <input
          type="time"
          value={editedEvent.eventTime || ""}
          onChange={(e) => {
            setEditedEvent({
              ...editedEvent,
              eventTime: e.target.value,
            });
            console.log(e);
          }}
          className="mb-2 border rounded-md p-2"
          placeholder="Event Time"
        />
      )}

      {/* <label className="block mb-2"> */}
      <span>Reminder Type:</span>
      <select
        value={editedEvent.reminderType}
        onChange={(e) =>
          setEditedEvent({
            ...editedEvent,
            reminderType: e.target.value,
          })}
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
      {/* </label> */}

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
