import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const AvailabilityModal = ({ user_id, onClose }) => {
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/my-calendar/${user_id}`, { withCredentials: true })
      .then((response) => {
        setAvailability(response.data);
      })
      .catch((error) => {
        console.error("Error fetching availability:", error);
      });
  }, [user_id]);

  const localizer = dateFnsLocalizer();

  return (
    <div className="availability-modal">
      <h2>Availability Calendar</h2>
      <Calendar
        localizer={localizer}
        events={availability}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default AvailabilityModal;
