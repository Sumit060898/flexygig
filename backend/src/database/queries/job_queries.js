const db = require('../connection.js');

const insertLocation = async ({ jobStreetAddress, jobCity, jobProvince, jobPostalCode }) => {
  const locationQuery = `
    INSERT INTO locations (StreetAddress, city, province, postalCode)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  try {
    const locationResult = await db.query(locationQuery, [jobStreetAddress, jobCity, jobProvince, jobPostalCode]);
    return locationResult.rows[0];
  } catch (err) {
    console.error("Error inserting location:", err);
    throw err;
  }
};

const postJob = async ({ jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, location_id, user_id }) => {
  const jobQuery = `
    INSERT INTO jobPostings (
      jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, location_id, user_id, jobfilled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) 
    RETURNING *;
  `;

  try {
    const jobResult = await db.query(jobQuery, [jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, location_id, user_id]);
    return jobResult.rows[0];
  } catch (err) {
    console.error("Error posting job:", err);
    throw err;
  }
};

const fetchPostedJobsByUserId = async (userId) => {
  const query = `
    SELECT jp.*, loc.StreetAddress, loc.city, loc.province, loc.postalCode
    FROM jobPostings jp
    JOIN locations loc ON jp.location_id = loc.location_id
    WHERE jp.user_id = $1;
  `;
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching posted jobs by user ID:", err);
    throw err;
  }
};

const fetchUnfilledJobsByUserId = async (userId) => {
  const query = `
    SELECT jp.*, loc.StreetAddress, loc.city, loc.province, loc.postalCode
    FROM jobPostings jp
    JOIN locations loc ON jp.location_id = loc.location_id
    WHERE jp.user_id = $1 AND jp.jobFilled = false;
  `;
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching unfilled jobs by user ID:", err);
    throw err;
  }
};

const fetchFilledJobsByUserId = async (userId) => {
  const query = `
    SELECT jp.*, loc.StreetAddress, loc.city, loc.province, loc.postalCode
    FROM jobPostings jp
    JOIN locations loc ON jp.location_id = loc.location_id
    WHERE jp.user_id = $1 AND jp.jobFilled = true;
  `;
  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching filled jobs by user ID:", err);
    throw err;
  }
};

const fetchJobByJobId = async (jobId) => {
  const query = `
    SELECT jp.*, loc.StreetAddress, loc.city, loc.province, loc.postalCode
    FROM jobPostings jp
    JOIN locations loc ON jp.location_id = loc.location_id
    WHERE jp.job_id = $1;
  `;
  try {
    const result = await db.query(query, [parseInt(jobId, 10)]);
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching job by job ID:", err);
    throw err;
  }
};

const updateJob = async (jobId, { jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, locationData, user_id }) => {
  try {

    const locationUpdateQuery = `
      UPDATE locations
      SET StreetAddress = $1, city = $2, province = $3, postalCode = $4
      FROM jobPostings
      WHERE locations.location_id = jobPostings.location_id AND jobPostings.job_id = $5;
    `;
    await db.query(locationUpdateQuery, [
      locationData.streetAddress,
      locationData.city,
      locationData.province,
      locationData.postalCode,
      jobId
    ]);


    const jobUpdateQuery = `
      UPDATE jobPostings
      SET jobTitle = $1, jobType = $2, jobDescription = $3, hourlyRate = $4, jobStart = $5, jobEnd = $6
      WHERE job_id = $7 AND user_id = $8
      RETURNING *;
    `;
    const result = await db.query(jobUpdateQuery, [
      jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, jobId, user_id
    ]);

    return result.rows[0];
  } catch (err) {
    console.error("Error updating job and location:", err);
    throw err;
  }
};

const deleteJobById = async (jobId) => {
  const query = `
    DELETE FROM jobPostings
    WHERE job_id = $1;
  `;
  try {
    await db.query(query, [jobId]);
    return { message: "Job successfully deleted" };
  } catch (err) {
    console.error("Error deleting job:", err);
    throw err;
  }
};

const fetchAllJobs = async (filters) => {
  let query = `
    SELECT jp.*, loc.StreetAddress, loc.city, loc.province, loc.postalCode, bs.business_name
    FROM jobPostings jp
    JOIN locations loc ON jp.location_id = loc.location_id
    JOIN businesses bs ON jp.user_id = bs.user_id
    WHERE 1=1
  `;

  const params = [];

  if (filters.jobType) {
    query += ` AND jp.jobType = $${params.length + 1}`;
    params.push(filters.jobType);
  }

  if (filters.hourlyRate) {
    const [minRate, maxRate] = filters.hourlyRate.split('-');
    query += ` AND jp.hourlyRate BETWEEN $${params.length + 1} AND $${params.length + 2}`;
    params.push(minRate, maxRate ? maxRate : minRate);
  }

  if (filters.startDate) {
    query += ` AND date_trunc('minute', jp.jobStart) = date_trunc('minute', $${params.length + 1}::timestamp)`;
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ` AND date_trunc('minute', jp.jobEnd) = date_trunc('minute', $${params.length + 1}::timestamp)`;
    params.push(filters.endDate);
  }

  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Error fetching all jobs with location details:", err);
    throw err;
  }
};

const applyForJob = async (jobId, applicantId) => {
  const query = `
    UPDATE jobPostings
    SET jobfilled = true, applicant_id = $2
    WHERE job_id = $1
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [jobId, applicantId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error applying for job:", err);
    throw err;
  }
};

const fetchAppliedJobs = async (applicantId) => {
  try {
    const result = await db.query(`
      SELECT jp.*, loc.StreetAddress, loc.city, loc.province, loc.postalCode, bs.business_name
      FROM jobPostings jp
      JOIN locations loc ON jp.location_id = loc.location_id
      JOIN businesses bs ON jp.user_id = bs.user_id
      WHERE jp.applicant_id = $1`,
      [applicantId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    throw error;
  }
};

const removeApplication = async (applicantId, jobId) => {
  try {
    const result = await db.query(`
      UPDATE jobpostings
      SET jobfilled = false, applicant_id = NULL
      WHERE applicant_id = $1 AND job_id = $2`,
      [applicantId, jobId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error removing job application:", error);
    throw error;
  }
};



module.exports = {
  postJob,
  insertLocation,
  fetchPostedJobsByUserId,
  fetchUnfilledJobsByUserId,
  fetchFilledJobsByUserId,
  fetchJobByJobId,
  updateJob,
  deleteJobById,
  fetchAllJobs,
  applyForJob,
  fetchAppliedJobs,
  removeApplication,
};