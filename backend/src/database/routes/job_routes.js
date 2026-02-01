const express = require('express');
const router = express.Router();
const job_queries = require("../queries/job_queries.js");

router.get("/posted-jobs/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const jobs = await job_queries.fetchPostedJobsByUserId(userId);
    res.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch posted jobs:", error);
    res.status(500).json({ message: "Failed to fetch unfilled jobs", error: error.message });
  }
});

router.get("/unfilled-jobs/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const jobs = await job_queries.fetchUnfilledJobsByUserId(userId);
    res.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch unfilled jobs:", error);
    res.status(500).json({ message: "Failed to fetch unfilled jobs", error: error.message });
  }
});

router.get("/filled-jobs/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const jobs = await job_queries.fetchFilledJobsByUserId(userId);
    res.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch filled jobs:", error);
    res.status(500).json({ message: "Failed to fetch filled jobs", error: error.message });
  }
});

router.post("/post-job", async (req, res) => {
  console.log("Received job post data:", req.body)
  try {
    const { jobStreetAddress, jobCity, jobProvince, jobPostalCode, userId, ...jobData } = req.body;
    const locationData = { jobStreetAddress, jobCity, jobProvince, jobPostalCode };

    const location = await job_queries.insertLocation(locationData);
    const location_id = location.location_id;

    const newJob = await job_queries.postJob({ ...jobData, location_id, });
    res.status(201).json({
      message: "Job and Location successfully created",
      job: newJob,
      location: location
    });
  } catch (error) {
    console.error("Failed to create job and location:", error);
    res.status(500).json({
      message: "Failed to create job and location",
      error: error.message,
    });
  }
});

router.get("/edit-job/:jobId", async (req, res) => {
  const { jobId } = req.params;
  console.log("Received jobId:", jobId);
  try {
    const job = await job_queries.fetchJobByJobId(jobId);
    if (job) {
      res.json(job);
    } else {
      res.status(404).send({ message: "Job not found" });
    }
  } catch (error) {
    console.error("Failed to fetch job details:", error);
    res.status(500).send({ message: "Failed to fetch job details", error: error.message });
  }
});

router.patch("/edit-job/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const jobData = req.body;

  try {
    const updatedJob = await job_queries.updateJob(parseInt(jobId, 10), jobData);
    if (updatedJob) {
      res.json({ message: "Job successfully updated", job: updatedJob });
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    console.error("Failed to update job:", error);
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
});

router.delete("/delete-job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    await job_queries.deleteJobById(jobId);
    res.json({ message: "Job successfully deleted" });
  } catch (error) {
    console.error("Failed to delete job:", error);
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
});

router.get("/all-jobs", async (req, res) => {
  try {
    const filters = req.query;
    const allJobs = await job_queries.fetchAllJobs(filters);
    res.json(allJobs);
  } catch (error) {
    console.error("Failed to fetch all jobs:", error);
    res.status(500).send({ message: "Failed to fetch all jobs", error: error.message });
  }
});

router.patch("/apply-job/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const applicantId = req.body.applicantId; // Assuming the applicant ID is sent in the request body

  try {
    await job_queries.applyForJob(jobId, applicantId);
    res.json({ message: "Applied successfully" });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Error applying for job", error: error.message });
  }
});

router.get("/applied-jobs/:applicantId", async (req, res) => {
  const { applicantId } = req.params;

  try {
    const appliedJobs = await job_queries.fetchAppliedJobs(applicantId);
    res.json({ jobs: appliedJobs })
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "Error fetching applied jobs" });
  }
});

router.patch("/remove-application/:applicantId/job/:jobId", async (req, res) => {
  const { applicantId, jobId } = req.params;

  try {
    await job_queries.removeApplication(applicantId, jobId)
    res.json({ message: "Application removed succesfully"});
  } catch (error) {
    console.error("Erros removing job application:", error);
    res.status(500).json({ message: "Error removing job application" });
  }
});

module.exports = router;