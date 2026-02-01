import "../styles/JobPosting.css";
import axios from "axios";
import CalendarIcon from "../assets/images/CalendarIcon.png";
import ChevronLeft from "../assets/images/ChevronLeft.png";
import DollarSign from "../assets/images/DollarSign.png";
import PlusSign from "../assets/images/PlusSign.png";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import JobPostingForm from "./JobPostingForm"

const JobPosting = () => {
    const { user } = useUser();
    const [jobs, setJobs] = useState([]);
    const [createJob, setCreateJob] = useState(false);
    const [editJob, setEditJob] = useState(false);
    const [removeJob, setRemoveJob] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            if (user && user.id) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/posted-jobs/${user.id}`, { withCredentials: true });
                    setJobs(response.data.jobs.sort(((a, b) => {
                        return a.jobtitle.localeCompare(b.jobtitle)
                    })));
                } catch (error) {
                    console.error("Error fetching posted jobs:", error);
                }
            }
        };

        fetchJobs();
    }, [user, createJob, editJob]);

    const handleCreateNew = () => { setCreateJob(true) };

    // handle remove operation
    const handleRemove = async (e) => {
        // get selected job to remove
        if (!removeJob) {
            // set job to be removed
            setRemoveJob(jobs.find(j => j.job_id.toString() === e.target.value));
        } else {
            // remove job after confirmation
            try {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/delete-job/${removeJob.job_id}`, { withCredentials: true });
                setRemoveJob(false) // clear selected job
                // update jobs list
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/posted-jobs/${user.id}`, { withCredentials: true });
                setJobs(response.data.jobs.sort(((a, b) => {
                    return a.jobtitle.localeCompare(b.jobtitle)
                })));
            } catch (error) {
                console.error("Failed to delete job:", error);
            }
        }
    };

    // handle cancelling the remove operation
    const handleCancelRemove = () => { setRemoveJob(false) };

    const handleEdit = (e) => {
        setEditJob(jobs.find(job => job.job_id.toString() === e.target.value));
    };

    // handle going back from create/edit job page
    const handleBack = () => {
        if (createJob) setCreateJob(false);
        else setEditJob(false);
    };

    // convert timestamp to readable date
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

    const listItems = jobs.length === 0 ? null : jobs.map(job => {
        return (
            <li key={job.job_id}>
                <div className="left">
                    <h2 className="posting-header">
                        {job.jobtitle}
                        <span style={{ color: "#C2554E", marginLeft: 10 }}>
                            {job.jobfilled ? "JOB FILLED" : ""}
                        </span>
                    </h2>
                    <div><img src={DollarSign} alt="dollar-sign" width="22px" height="auto" />{job.hourlyrate}/hr</div>
                    <div><img id="calendar-icon" src={CalendarIcon} alt="calendar-icon" width="22px" height="auto" />{formatDateForDisplay(job.jobstart)}</div>
                </div>
                <div className="right">
                    <button id="remove-btn" value={job.job_id} onClick={handleRemove}>Remove</button>
                    <button id="edit-btn" value={job.job_id} onClick={handleEdit}>Edit</button>
                </div>
            </li>);
    });

    return (
        <div className="job-posting-container">
            {!createJob && !editJob ? (
                <div>
                    <h1 className="page-header">Job Posting</h1>
                    <button className="create-new-btn" onClick={handleCreateNew}>
                        <span>Create New</span>
                        <img src={PlusSign} alt="create-new" width="13px" height="auto" />
                    </button>
                    {listItems ? <ul style={{ listStyleType: "none" }}>{listItems}</ul> : <div>No Gigs Posted</div>}
                </div>) : (
                createJob ? (
                    <div>
                        <img id="back-btn" src={ChevronLeft} alt="back" width="45px" height="auto" onClick={handleBack} />
                        <JobPostingForm setDone={handleBack} />
                    </div>
                ) : (
                    <div>
                        <img id="back-btn" src={ChevronLeft} alt="back" width="45px" height="auto" onClick={handleBack} />
                        <JobPostingForm job={editJob} setDone={handleBack} />
                    </div>
                )
            )}
            {removeJob && (
                <div className="remove-job-container">
                    <div className="prompt">
                        <div className="prompt-text">
                            <p>Are you sure you want to remove</p>
                            <p>{removeJob.jobtitle}?</p>
                        </div>
                        <div className="prompt-buttons">
                            <button onClick={handleCancelRemove}>Cancel</button>
                            <button className="remove-btn" onClick={handleRemove}>Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobPosting;
