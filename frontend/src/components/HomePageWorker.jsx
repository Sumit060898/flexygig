import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/HomePage.css";
import { useUser } from "./UserContext";

const HomePage = () => {
  const { user, setUser } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterRate, setFilterRate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/all-jobs`, { withCredentials: true });
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchFilteredJobs = async () => {
    try {
      const params = new URLSearchParams();

      if (filterType) params.append("jobType", filterType);
      if (filterRate) params.append("hourlyRate", filterRate);
      if (filterLocation) params.append("location", filterLocation);
      if (filterDate.startDate)
        params.append("startDate", filterDate.startDate);
      if (filterDate.endDate) params.append("endDate", filterDate.endDate);

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/all-jobs?${params.toString()}`, { withCredentials: true });
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleSearch = () => {
    fetchFilteredJobs();
  };

  const handleApply = async (jobId) => {
    const userId = user.id;

    try {
      await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/apply-job/${jobId}`, { userId }, { withCredentials: true });
      setJobs((currentJobs) =>
        currentJobs.filter((job) => job.job_id !== jobId)
      );
    } catch (error) {
      console.error("Error applying for job:", error);
    }
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
    <div className="my-jobs-container">
      <h1>Choose your next Gig!</h1>
      <div className="filters">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Skills</option>
          <option value="Event Staffing">Event Staffing</option>
          <option value="Hospitality Services">Hospitality Services</option>
          <option value="Retail Assistance">Retail Assistance</option>
          <option value="Delivery Services">Delivery Services</option>
          <option value="Maintenance and Repair">Maintenance and Repair</option>
          <option value="Personal Services">Personal Services</option>
          <option value="Construction and Renovation">
            Construction and Renovation
          </option>
          <option value="Healthcare Assistance">Healthcare Assistance</option>
          <option value="Transportation Services">
            Transportation Services
          </option>
          <option value="Technical Support">Technical Support</option>
          <option value="Cleaning Services">Cleaning Services</option>
          <option value="Fitness Instruction">Fitness Instruction</option>
          <option value="Photography and Videography">
            Photography and Videography
          </option>
          <option value="Creative Services">Creative Services</option>
          <option value="Security Services">Security Services</option>
        </select>

        <select
          value={filterRate}
          onChange={(e) => setFilterRate(e.target.value)}
        >
          <option value="">Hourly Rate</option>
          {[...Array(9)].map((_, i) => (
            <option key={i} value={`${10 + i * 10}-${10 + (i + 1) * 10}`}>
              ${10 + i * 10} - ${10 + (i + 1) * 10}
            </option>
          ))}
          <option value=">100">&gt;$100</option>
        </select>

        {/* <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
          <option value="">Distance</option>
          <option value="<5">&lt;5km</option>
          {[...Array(9)].map((_, i) => (
            <option key={i} value={`${5 + i * 5}-${5 + (i + 1) * 5}`}>{5 + i * 5}km - {5 + (i + 1) * 5}km</option>
            ))}
          <option value=">50">&gt;50km</option>
        </select> */}

        <div className="date-filter">
          <label htmlFor="startDate">Start Date & Time:</label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={filterDate.startDate}
            onChange={(e) =>
              setFilterDate({ ...filterDate, startDate: e.target.value })
            }
          />
          <label htmlFor="endDate">End Date & Time:</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={filterDate.endDate}
            onChange={(e) =>
              setFilterDate({ ...filterDate, endDate: e.target.value })
            }
          />
        </div>
      </div>

      <button onClick={handleSearch}>Search</button>
      <ul className="jobs-list">
        {jobs.map((job) => (
          <li key={job.job_id} className="job-item">
            <div className="job-info">
              <h2>{job.jobtitle}</h2>
              <h3>Business Name:</h3>
              <p>{job.business_name}</p>
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
              <p>
                {job.streetaddress}, {job.city}, {job.province},{" "}
                {job.postalcode}
              </p>
            </div>
            <div className="job-actions">
              <button onClick={() => handleApply(job.job_id)}>Apply</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
