import axios from "axios";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUser } from "./UserContext";
import "../styles/Calendar.css";

const EventCalendar = () => {
  const { user } = useUser();
  const [newEvent, setNewEvent] = useState({
    title: "Available",
    start: "",
    end: "",
  });
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addedEvents, setAddedEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isTimeEditable, setIsTimeEditable] = useState(false);

  const locales = {
    "en-CA": require("date-fns/locale/en-CA"),
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const fetchUpdatedEvents = () => {
    if (!user) return;

    const user_id = user.id;

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/my-calendar/${user_id}`, { withCredentials: true })
      .then((response) => {
        const formattedEvents = response.data.map((event) => {
          const startDateTime = `${event.startdate} ${event.starttime}`;
          const endDateTime = `${event.enddate} ${event.endtime}`;

          return {
            id: event.id,
            title: event.title, // Use the title from the backend
            start: new Date(startDateTime),
            end: new Date(endDateTime),
          };
        });
        setAllEvents(formattedEvents);
      })
      .catch((error) => {
        console.error("Error fetching events:", error.response || error.message);
        setMessage("Failed to fetch events. Please try again later.");
      });
  };

  useEffect(() => {
    fetchUpdatedEvents();
    const pollingInterval = setInterval(() => {
      fetchUpdatedEvents();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollingInterval);
  }, [user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const generateTimeOptions = (includeDefault = true) => {
    const times = includeDefault ? ["Select Time"] : [];
    for (let hour = 0; hour < 24; hour++) {
      const period = hour < 12 ? "AM" : "PM";
      const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      times.push(`${String(formattedHour).padStart(2, "0")}:00 ${period}`);
    }
    return times;
  };

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const convertTo24HourFormat = (time) => {
    const [hour, minute, period] = time.match(/(\d+):(\d+)\s(AM|PM)/i).slice(1);
    const hour24 = period === "PM" && hour !== "12" ? +hour + 12 : period === "AM" && hour === "12" ? 0 : +hour;
    return `${String(hour24).padStart(2, "0")}:${minute}`;
  };

  const handleAddEvent = () => {
    if (!startTime || !endTime) {
      return setMessage("Please select both start and end times.");
    }

    if (startTime === endTime) {
      return setMessage("Start and end times are the same.");
    }

    const startTime24 = convertTo24HourFormat(startTime);
    const endTime24 = convertTo24HourFormat(endTime);

    if (new Date(`2000-01-01T${endTime24}:00`) < new Date(`2000-01-01T${startTime24}:00`)) {
      return setMessage("End time cannot be before start time.");
    }

    if (addedEvents.some((event) => event.start === newEvent.start && event.end === newEvent.end)) {
      setMessage("Selected days are already added. Please choose different days.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const user_id = user.id;

    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/api/my-calendar`, {
        user_id,
        startDate: newEvent.start,
        endDate: newEvent.end,
        startTime,
        endTime,
        title: newEvent.title, // Include the title in the request
      }, { withCredentials: true })
      .then(() => {
        setMessage("Schedule added successfully");
        setTimeout(() => setMessage(""), 5000);
        fetchUpdatedEvents();
        setAddedEvents([...addedEvents, newEvent]);
        setStartTime("");
        setEndTime("");
      })
      .catch((error) => {
        console.error("Error adding event:", error);
        setMessage("Error adding event.");
      });
  };

  const handleDeleteSelected = () => {
    if (!selectedEvent) {
      setMessage("No event selected to delete.");
      return;
    }

    const eventIdToDelete = selectedEvent.id;

    axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/my-calendar/${eventIdToDelete}`, { withCredentials: true })
      .then(() => {
        fetchUpdatedEvents();
        setSelectedEvent(null);
        setMessage("Selected event deleted successfully.");
        setTimeout(() => setMessage(""), 5000);
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        setMessage("Error deleting event.");
      });
  };

  const handleDateChange = (dates) => {
    if (dates[0] && dates[1] && dates[0] > dates[1]) {
      setMessage("Start date cannot be after end date.");
      return;
    }
    setNewEvent({ start: dates[0], end: dates[1] });
    setIsTimeEditable(!!dates[0] && !!dates[1]);
  };

  const handleSelectSlot = (slotInfo) => {
    const start = slotInfo.start;
    const end = slotInfo.end;

    const formattedStartTime = format(start, "hh:mm a");
    const formattedEndTime = format(end, "hh:mm a");

    setNewEvent({
      ...newEvent,
      start: start,
      end: end,
    });

    setStartTime(formattedStartTime);
    setEndTime(formattedEndTime);

    setIsTimeEditable(true);
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="calendar">
      <div className="calendar-main">
        <p>Choose your availability.</p>
        <DatePicker
          placeholderText="Select Start and End Dates"
          selectsRange
          startDate={newEvent.start}
          endDate={newEvent.end}
          onChange={handleDateChange}
          minDate={new Date()}
          inline
        />
        <div className="calendar-title">
          <label>Event Title:</label>
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Enter event title"
          />
        </div>
        <div className="calendar-starttime">
          <label>Start Time:</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={!isTimeEditable}>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div className="calendar-endtime">
          <label>End Time:</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={!isTimeEditable}>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddEvent}
          disabled={!startTime || !endTime || !newEvent.start || !newEvent.end}
          aria-label="Add Availability">
          Add Availability
        </button>

        {selectedEvent && (
          <div className="calendar-event-details">
            <h3>Event Details</h3>
            <p><strong>Title:</strong> {selectedEvent.title}</p>
            <p><strong>Start:</strong> {selectedEvent.start.toLocaleString()}</p>
            <p><strong>End:</strong> {selectedEvent.end.toLocaleString()}</p>
            <button onClick={handleDeleteSelected}>Delete Selected Event</button>
          </div>
        )}
        {message && <p id="calendar-message">{message}</p>}
      </div>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor={(event) => new Date(event.start)}
          endAccessor={(event) => new Date(event.end)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
};

export default EventCalendar;
