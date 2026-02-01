import "../styles/CalendarWidget.css";
import PinIcon from "../assets/images/calendar-pin.svg";
import CalendarIcon from "../assets/images/calendar-icon.svg";
import ClockIcon from "../assets/images/calendar-clock.svg";
import PeopleIcon from "../assets/images/calendar-people.svg";
import PencilIcon from "../assets/images/calendar-pencil.svg";

const CalendarWidget = () => {
    // JS
    const locale = 'en-US';
    const today = new Date();
    const weekday = today.toLocaleDateString(locale, { weekday: "long" });
    const month = today.toLocaleDateString(locale, { month: "short" });

    // TODO: get upcoming events from user once set up in database

    // HTML
    return (
        <div className="CalendarWidget">
            <div id="calendar-title">
                Calendar
                </div>
            <div id="calendar-place">
                <img id="calendar-icons" src={PinIcon} alt=""/>
                Add Place
            </div>
            <div id="calendar-datetime-container">
                <div id="calendar-date">
                    <img id="calendar-icons" src={CalendarIcon} alt=""/>
                    Add Date
                </div>
                <div id="calendar-time">
                    <img id="calendar-icons" src={ClockIcon} alt=""/>
                    Add Time
                </div>
            </div>
            <div id="calendar-upcoming">
                <img id="calendar-icons" src={PeopleIcon} alt=""/>
                Upcoming
            </div>
            <div id="calendar-notes">
                <img id="calendar-icons" src={PencilIcon} alt=""/>
                Add Notes
            </div>
        </div>
    );
};

export default CalendarWidget;
