import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyJobs.css";
import { useUser } from "./UserContext";


const MyJobs = () => {
  const { user, setUser } = useUser();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobPosting, setJobPosting] = useState([]);
  const [activeTab, setActiveTab] = useState('posted'); // 'posted' or 'applied'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnfilledJobs = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/unfilled-jobs/${user.id}`, { withCredentials: true });
          setJobPosting(response.data.jobs);
        } catch (error) {
          console.error("Error fetching unfilled jobs:", error);
        }
      }
    };

    const fetchFilledJobs = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/filled-jobs/${user.id}`, { withCredentials: true });
          setAppliedJobs(response.data.jobs);
        } catch (error) {
          console.error("Error fetching filled jobs:", error);
        }
      }
    };

    fetchUnfilledJobs();
    fetchFilledJobs();
  }, [user]);

  const handleEdit = (job) => {
    navigate('/edit-job', { state: { job } });
  };

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/delete-job/${jobId}`, { withCredentials: true });
      const unfilledResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/unfilled-jobs/${user.id}`, { withCredentials: true });
      setJobPosting(unfilledResponse.data.jobs);
      const filledResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/filled-jobs/${user.id}`, { withCredentials: true });
      setAppliedJobs(filledResponse.data.jobs);
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const handleAddJob = () => {
    navigate("/create-job");
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


  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="my-jobs-container">
      {user.isbusiness ? (
        <>
          <div className="header-container">
            <h1>Jobs Posted</h1>
            <button className="add-job-button" onClick={handleAddJob}>+ Post a New Job</button>
          </div>
          <ul className="jobs-list">
            {jobPosting.map(job => (
              <li key={job.job_id} className="job-item">
                <div className="job-info">
                  <h2>{job.jobtitle}</h2>
                  <h3>Description:</h3>
                  <p>{job.jobdescription}</p>
                  <h3>Type:</h3>
                  <p>{job.jobtype}</p>
                  <h3>Hourly Rate:</h3>
                  <p>${job.hourlyrate}</p>
                  <h3>Start:</h3>
                  <p>{formatDateForDisplay(job.jobstart)}</p>
                  <h3>End:</h3>
                  <p>{formatDateForDisplay(job.jobend)}</p>
                  <h3>Address:</h3>
                  <p>{job.streetaddress}, {job.city}, {job.province}, {job.postalcode}</p>
                </div>
                <div className="job-actions">
                  <button onClick={() => handleEdit(job)}>Edit</button>
                  <button onClick={() => handleDelete(job.job_id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>) : (
        <>
          <div className="header-container">
            <h1>Jobs Applied</h1>
          </div>
          <ul className="jobs-list">
            {appliedJobs.map(job => (
              <li key={job.job_id} className="job-item">
                <div className="job-info">
                  <h2>{job.jobtitle}</h2>
                  <h3>Description:</h3>
                  <p>{job.jobdescription}</p>
                  <h3>Type:</h3>
                  <p>{job.jobtype}</p>
                  <h3>Hourly Rate:</h3>
                  <p>${job.hourlyrate}</p>
                  <h3>Start:</h3>
                  <p>{formatDateForDisplay(job.jobstart)}</p>
                  <h3>End:</h3>
                  <p>{formatDateForDisplay(job.jobend)}</p>
                  <h3>Address:</h3>
                  <p>{job.streetaddress}, {job.city}, {job.province}, {job.postalcode}</p>
                </div>
                <button onClick={() => handleDelete(job.job_id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default MyJobs;
