import "../styles/JobPostingForm.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext";

const JobPostingForm = ({ job, setDone }) => {
    const { user } = useUser();
    const [editing, setEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [jobPost, setJobPost] = useState({
        jobTitle: "",
        jobType: "",
        jobDescription: "",
        hourlyRate: "",
        jobStart: "",
        jobEnd: "",
        jobStreetAddress: "",
        jobCity: "",
        jobProvince: "",
        jobPostalCode: "",
        user_id: user ? user.id : null,
    });

    const formatDateTimeForInput = (dateTime) => {
        if (!dateTime) return "";
        const date = new Date(dateTime);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        var day = date.getDate()
        day = day < 10 ? "0" + day : day;
        var formattedDate = year + "-" + month + "-" + day + "T" + date.toTimeString().slice(0, 5);
        return formattedDate;
    };

    useEffect(() => {
        if (job) {
            setEditing(true);
            setJobPost({
                ...job,
                jobTitle: job.jobtitle,
                jobType: job.jobtype,
                jobDescription: job.jobdescription,
                hourlyRate: job.hourlyrate.toString(),
                jobStreetAddress: job.streetaddress,
                jobCity: job.city,
                jobProvince: job.province,
                jobPostalCode: job.postalcode,
                jobStart: formatDateTimeForInput(job.jobstart),
                jobEnd: formatDateTimeForInput(job.jobend),
                job_id: job.job_id,
                location_id: job.location_id,
            });
        }
    }, [job]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJobPost((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const locationData = {
            streetAddress: jobPost.jobStreetAddress,
            city: jobPost.jobCity,
            province: jobPost.jobProvince,
            postalCode: jobPost.jobPostalCode,
        };
        const updatedJobData = { ...jobPost, locationData };
        const apiUrl = editing ? `${process.env.REACT_APP_BACKEND_URL}/api/edit-job/${jobPost.job_id}` : `${process.env.REACT_APP_BACKEND_URL}/api/post-job`;

        try {
            await axios[editing ? "patch" : "post"](apiUrl, updatedJobData, {
                headers: { "Content-Type": "application/json" },
            }, { withCredentials: true });
            setDone()
        } catch (error) {
            console.error("Failed to process job:", error.message);
            setErrorMessage("Failed to process job. Please try again.");
        }
    };

    return (
        <div className="job-posting-form-container">
            <form onSubmit={handleSubmit}>
                <div className="top">
                    <div className="top-left">
                        <label htmlFor="jobTitle">Job Title</label>
                        <input
                            type="text"
                            id="jobTitle"
                            name="jobTitle"
                            value={jobPost.jobTitle}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="jobType">Job Type</label>
                        <input
                            type="text"
                            id="jobType"
                            name="jobType"
                            value={jobPost.jobType}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="top-right">
                        <button type="submit">{editing ? "Update Job" : "Post Job"}</button>
                    </div>
                </div>
                <div className="bottom">
                    <div className="bottom-left">
                        <h1>Job Details</h1>
                        <div className="details">
                            <label htmlFor="hourlyRate">Hourly Rate ($)</label>
                            <input
                                type="number"
                                min="0"
                                id="hourlyRate"
                                name="hourlyRate"
                                value={jobPost.hourlyRate}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="jobStart">Job Start Date, Time</label>
                            <input
                                type="datetime-local"
                                id="jobStart"
                                name="jobStart"
                                value={jobPost.jobStart}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="jobEnd">Job End Date, Time</label>
                            <input
                                type="datetime-local"
                                id="jobEnd"
                                name="jobEnd"
                                value={jobPost.jobEnd}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <h1>Location</h1>
                        <div className="location">
                            <label htmlFor="jobStreetAddress">Street Address</label>
                            <input
                                type="text"
                                id="jobStreetAddress"
                                name="jobStreetAddress"
                                value={jobPost.jobStreetAddress}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="jobCity">City</label>
                            <input
                                type="text"
                                id="jobCity"
                                name="jobCity"
                                value={jobPost.jobCity}
                                onChange={handleChange}
                                required
                            />
                            <div className="province">
                                <label htmlFor="jobProvince">Province</label>
                                <select
                                    id="jobProvince"
                                    name="jobProvince"
                                    value={jobPost.jobProvince}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Alberta">AB</option>
                                    <option value="British Columbia">BC</option>
                                    <option value="Manitoba">MB</option>
                                    <option value="New Brunswick">NB</option>
                                    <option value="Newfoundland and Labrador">NL</option>
                                    <option value="Nova Scotia">NS</option>
                                    <option value="Ontario">ON</option>
                                    <option value="Prince Edward Island">PE</option>
                                    <option value="Quebec">QC</option>
                                    <option value="Saskatchewan">SK</option>
                                    <option value="Northwest Territories">NT</option>
                                    <option value="Nunavut">NU</option>
                                    <option value="Yukon">YT</option>
                                </select>
                            </div>
                            <div className="postal">
                                <label htmlFor="jobPostalCode">Postal Code</label>
                                <input
                                    type="text"
                                    id="jobPostalCode"
                                    name="jobPostalCode"
                                    value={jobPost.jobPostalCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                    </div>
                    <div className="bottom-right">
                        <label htmlFor="jobDescription">Job Description</label>
                        <textarea
                            id="jobDescription"
                            name="jobDescription"
                            value={jobPost.jobDescription}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default JobPostingForm;
