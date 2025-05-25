import React from "react";
import { useState } from "react";
import EventItem from "./eventItem";
import EditEventForm from "./editEventForm";

function EventsList({ events, fetchEvents }) {
  const [editingEvent, setEditingEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({});
  return (
    <>
    
      <ul className="space-y-4 mb-8">
        {!!events &&
          events.map((event, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
            >
              {editingEvent && editingEvent === event._id ? (
                // Edit Mode
                <EditEventForm
                  editedEvent={editedEvent}
                  editingEvent={editingEvent}
                  setEditedEvent={setEditedEvent}
                  setEditingEvent={setEditingEvent}
                  fetchEvents={fetchEvents}
                />
              ) : (
                <EventItem
                  event={event}
                  fetchEvents={fetchEvents}
                  setEditedEvent={setEditedEvent}
                  setEditingEvent={setEditingEvent}
                />
              )}
            </li>
          ))}
      </ul>
    </>
  );
}

export default EventsList;
