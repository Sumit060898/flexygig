import "../styles/JobDetails.css";
import CalendarIcon from "../assets/images/CalendarIcon.png";
import DefaultAvatar from "../assets/images/DefaultAvatar.png";
import MessageBubbles from "../assets/images/MessageBubbles.png";
import DollarSign from "../assets/images/DollarSign.png";
import { useNavigate } from "react-router-dom";

const JobDetails = ({ jobDetails, handleApply }) => {
    const navigate = useNavigate();

    const handleEmployer = () => { };

    const handleMessage = () => {
        navigate(`/messages`, { state: { partnerId: jobDetails.user_id } });
    };

    const formatDateForDisplay = (dateTime) => {
        if (!dateTime) return "";
        const date = new Date(dateTime);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div className="job-details-container">
            <div className="top">
                <div className="top-left">
                    <h1>{jobDetails.jobtitle}</h1>
                    <button onClick={handleApply} value={jobDetails.job_id}>Apply Now</button>
                </div>
                <div className="top-right">
                    <button onClick={handleEmployer}>
                        <img src={DefaultAvatar} alt="employer-avatar" width="32px" height="auto" />
                        {jobDetails.business_name}
                    </button>
                    <button onClick={handleMessage}>
                        <img src={MessageBubbles} alt="message-bubbles" width="35px" height="auto" />
                        Message
                    </button>
                </div>
            </div>
            <div className="bottom">
                <div className="bottom-left">
                    <div className="details-div">
                        <h1>Job Details</h1>
                        <div>
                            <img src={DollarSign} alt="dollar-sign" width="22px" height="auto" />
                            {jobDetails.hourlyrate}/hr
                        </div>
                        <div>
                            <img id="calendar-icon" src={CalendarIcon} alt="calendar-icon" width="22px" height="auto" />
                            {formatDateForDisplay(jobDetails.jobstart)}
                        </div>
                    </div>
                    <div className="location-div">
                        <h1>Location</h1>
                        <p>{jobDetails.streetaddress}, {jobDetails.city},</p>
                        <p>{jobDetails.province} {jobDetails.postalcode}</p>
                    </div>
                </div>
                <div className="bottom-right">
                    <h1>Job Description</h1>
                    <div>{jobDetails.jobdescription}</div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
