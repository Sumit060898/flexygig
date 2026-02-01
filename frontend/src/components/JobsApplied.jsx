import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JobsApplied.css";
import { useUser } from "./UserContext";
import CalendarIcon from "../assets/images/CalendarIcon.png";
import DollarSign from "../assets/images/DollarSign.png";
import DefaultAvatar from "../assets/images/DefaultAvatar.png";
import MessageBubbles from "../assets/images/MessageBubbles.png";


const JobsApplied = () => {
  const { user } = useUser();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [refresh, setRefresh] = useState();
  const [removing, setRemoving] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (user && user.id) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/applied-jobs/${user.id}`, { withCredentials: true });
          setAppliedJobs(res.data.jobs.sort(((a, b) => {
            return a.jobstart.localeCompare(b.jobstart)
          })));
        } catch (error) {
          console.error("Error fetching filled jobs:", error);
        }
      }
    };
    fetchAppliedJobs();
  }, [user, refresh]);

  const handleRemove = async (e) => {
    const jobId = e.target.value;
    if (!removing) {
      setRemoving(appliedJobs.find(job => job.job_id.toString() === jobId))
    } else {
      try {
        await axios.patch(`api/remove-application/${user.id}/job/${jobId}`);
        setRemoving(false)
        setRefresh(!refresh)
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    }
  };

  const findJob = () => {
    navigate("/find-gigs");
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

  const handleEmployer = () => { };

  const handleMessage = (job) => {
    navigate(`/messages`, { state: { partnerId: job.user_id } });
  };

  const handleCancel = () => {
    if (removing) setRemoving(false);
  }

  return (
    <div className="jobs-applied-container">
      <div className="header-container">
        <h1>Jobs Applied</h1>
        <button className="add-job-button" onClick={findJob}>+ Find a New Job</button>
      </div>
      <ul className="jobs-list">
        {appliedJobs.map(job => (
          <li key={job.job_id} className="job-item">
            <div className="top">
              <div className="top-left">
                <h1>{job.jobtitle}</h1>
                <button onClick={handleRemove} value={job.job_id}>Remove</button>
              </div>
              <div className="top-right">
                <button onClick={handleEmployer}>
                  <img src={DefaultAvatar} alt="employer-avatar" width="32px" height="auto" />
                  {job.business_name}
                </button>
                <button onClick={() => handleMessage(job)}>
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
                    {job.hourlyrate}/hr
                  </div>
                  <div>
                    <img id="calendar-icon" src={CalendarIcon} alt="calendar-icon" width="22px" height="auto" />
                    {formatDateForDisplay(job.jobstart)}
                  </div>
                </div>
                <div className="location-div">
                  <h1>Location</h1>
                  <p>{job.streetaddress}, {job.city},</p>
                  <p>{job.province} {job.postalcode}</p>
                </div>
              </div>
              <div className="bottom-right">
                <h1>Job Description</h1>
                <div>{job.jobdescription}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {removing &&
        <div className="comfirm-removal-container">
          <div className="prompt">
            <div className="prompt-text">
              <p>Are you sure you want to remove</p>
              <p>{removing.jobtitle}?</p>
            </div>
            <div className="prompt-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button className="remove-btn" onClick={handleRemove} value={removing.job_id}>Remove</button>
            </div>
          </div>
        </div>}
    </div>
  );
};

export default JobsApplied;
