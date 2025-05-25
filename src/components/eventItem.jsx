import React from "react";
import { useState } from "react";
import axios from "axios";

function EventItem({ event, setEditedEvent, setEditingEvent, fetchEvents }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePromiseResolver, setDeletePromiseResolver] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get appropriate badge class based on event type
  const getBadgeClass = (type) => {
    switch(type.toLowerCase()) {
      case 'birthday':
        return 'event-badge event-badge-birthday';
      case 'anniversary':
        return 'event-badge event-badge-anniversary';
      default:
        return 'event-badge event-badge-other';
    }
  };

  // Get appropriate icon based on event type
  const getEventIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💍';
      default:
        return '📅';
    }
  };

  // Edit event
  const handleEdit = async (event) => {
    setEditingEvent(event._id);
    setEditedEvent({ ...event });
  };

  const handleDelete = async (event) => {
    const userConfirmed = await confirmDelete(event);

    if (userConfirmed) {
      try {
        setIsDeleting(true);
        await axios.delete("/api/delete-event", { data: { id: event._id } });
        console.log("Event deleted successfully");
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    } else {
      console.log("User canceled the delete action");
    }
  };

  // Function to show the modal and return a promise
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);

    return new Promise((resolve) => {
      setDeletePromiseResolver(() => resolve);
    });
  };

  // Handle user response in the modal
  const handleModalResponse = (confirmed) => {
    if (deletePromiseResolver) {
      deletePromiseResolver(confirmed);
    }
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center w-full">
        <div className="flex items-center mb-2 sm:mb-0">
          <span className="text-2xl mr-3">{getEventIcon(event.eventType)}</span>
          <div>
            <div className="text-lg font-medium text-gray-800">{event.eventName}</div>
            <div className="flex items-center">
              <span className={getBadgeClass(event.eventType)}>
                {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                {event.eventDate.replace(/-/g, "/")}
                {event.eventTime && <>&nbsp; at {event.eventTime}</>}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 text-sm text-gray-600 truncate my-2 sm:mx-4 sm:my-0">
          {event.notes || ""}
        </div>
        
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            onClick={() => handleEdit(event)}
            className="text-indigo-600 hover:text-indigo-800 transition p-1"
            title="Edit Event"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(event)}
            className="text-red-500 hover:text-red-700 transition p-1"
            title="Delete Event"
            disabled={isDeleting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete the event "
              {eventToDelete?.eventName}"?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleModalResponse(false)}
                className="btn-neutral"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleModalResponse(true)}
                className="btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EventItem;