import React from "react";
import { useState } from "react";
import EventItem from "./eventItem";
import EditEventForm from "./editEventForm";

function EventsList({ events, fetchEvents }) {
  const [editingEvent, setEditingEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({});
  
  // Group events by type for better organization
  const groupedEvents = events.reduce((groups, event) => {
    const type = event.eventType.toLowerCase();
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(event);
    return groups;
  }, {});
  
  // Sort events by date
  const sortEvents = (events) => {
    return [...events].sort((a, b) => {
      // Extract month and day for comparison
      const [aMonth, aDay] = a.eventDate.split('/').map(Number);
      const [bMonth, bDay] = b.eventDate.split('/').map(Number);
      
      // Compare months first
      if (aMonth !== bMonth) return aMonth - bMonth;
      // If months are the same, compare days
      return aDay - bDay;
    });
  };
  
  // Get appropriate section title and icon
  const getSectionInfo = (type) => {
    switch(type) {
      case 'birthday':
        return { title: 'Birthdays', icon: '🎂' };
      case 'anniversary':
        return { title: 'Anniversaries', icon: '💍' };
      default:
        return { title: 'Other Events', icon: '📅' };
    }
  };
  
  // Order of event types to display
  const eventTypeOrder = ['birthday', 'anniversary', 'other'];
  
  return (
    <div className="space-y-6">
      {eventTypeOrder.map(type => {
        const eventsOfType = groupedEvents[type] || [];
        if (eventsOfType.length === 0) return null;
        
        const { title, icon } = getSectionInfo(type);
        const sortedEvents = sortEvents(eventsOfType);
        
        return (
          <div key={type} className="card">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">{icon}</span>
              {title}
              <span className="ml-2 text-sm font-normal text-gray-500">({eventsOfType.length})</span>
            </h3>
            
            <ul className="divide-y divide-gray-100">
              {sortedEvents.map((event) => (
                <li key={event._id} className="py-3">
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
                    // View Mode
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
          </div>
        );
      })}
    </div>
  );
}

export default EventsList;