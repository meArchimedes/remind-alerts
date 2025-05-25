import React from "react";

function DateInput({
  eventDate,
  setEventDate,
  isRecurringEvent,
  editedEvent,
  setEditedEvent,
}) {
  const isEdit = !!editedEvent;
  const currentEventDate = isEdit ? editedEvent?.eventDate : eventDate;

  const getDateInputProps = () => {
    const handleDateChange = (e) => {
      let value = e.target.value.replace(/[^\d]/g, ""); // Remove non-numeric characters

      // Format value to MM/DD
      if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      }

      isEdit
        ? setEditedEvent({ ...editedEvent, eventDate: value })
        : setEventDate(value);
    };

    const handleBlur = () => {
      // Validate the input when the user leaves the field
      if (isRecurringEvent) {
        const [month, day] = (currentEventDate || "").split("/");
        if (
          !month ||
          !day ||
          isNaN(month) ||
          isNaN(day) ||
          month < 1 ||
          month > 12 ||
          day < 1 ||
          day > 31
        ) {
          // Reset to empty if invalid
          isEdit
            ? setEditedEvent({ ...editedEvent, eventDate: "" })
            : setEventDate("");
          alert("Please enter a valid date in MM/DD format.");
        }
      }
    };

    if (isRecurringEvent) {
      return {
        type: "text",
        placeholder: "MM/DD",
        maxLength: 5,
        value: currentEventDate || "",
        pattern: "^(0[1-9]|1[0-2])/([0-2][0-9]|3[0-1])$",
        onChange: handleDateChange,
        onBlur: handleBlur,
        title: "Enter the date in MM/DD format",
        className: "w-full rounded-lg",
      };
    } else {
      return {
        type: "date",
        value: currentEventDate || "",
        onChange: (e) =>
          isEdit
            ? setEditedEvent({ ...editedEvent, eventDate: e.target.value })
            : setEventDate(e.target.value),
        min: new Date().toISOString().split("T")[0],
        className: "w-full rounded-lg",
      };
    }
  };

  return <input {...getDateInputProps()} required />;
}

export default DateInput;
