// src/database/routes/worker_routes.js
const express = require("express");
const router = express.Router();
const workers_queries = require("../queries/workers_queries.js");
const db = require("../connection.js");

/**
 * =========================
 * Existing: list all workers (profiles)
 * =========================
 * NOTE:
 * If your DB now allows multiple profiles per user, this endpoint may return
 * multiple rows per user depending on how fetchWorkers() is implemented.
 * (Usually you want only the PRIMARY profile per user on this list.)
 */
router.get("/gig-workers", async (req, res) => {
  try {
    const workers = await workers_queries.fetchWorkers();
    res.json(workers);
  } catch (err) {
    console.error("Error in /api/gig-workers", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * =========================
 * NEW: Multi-profile endpoints
 * =========================
 */

/**
 * Get all worker profiles for a user
 * GET /api/worker-profiles/:userId
 *
 * Returns rows from `workers` table (should include role_name if the column exists).
 */
router.get("/worker-profiles/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

  try {
    const profiles = await workers_queries.getWorkerProfilesByUserId(userId);
    res.status(200).json(profiles);
  } catch (err) {
    console.error("Error in /api/worker-profiles/:userId", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get primary worker profile for a user
 * GET /api/worker-profiles/:userId/primary
 */
router.get("/worker-profiles/:userId/primary", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

  try {
    const profile = await workers_queries.getPrimaryWorkerProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Primary worker profile not found" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error("Error in /api/worker-profiles/:userId/primary", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Create a new worker profile under a user
 * POST /api/worker-profiles
 * Body: { userId, firstName, lastName, profileName, roleName?, makePrimary? }
 *
 * roleName is NEW (e.g., "Gardener", "Bartender") so the UI can show:
 *   "Default (Gardener)"
 */
router.post("/worker-profiles", async (req, res) => {
  const { userId, firstName, lastName, profileName, roleName, makePrimary } = req.body;

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) return res.status(400).json({ message: "Invalid userId" });

  // Keep same required fields behavior (do not remove existing validation)
  if (!firstName || !lastName || !profileName) {
    return res.status(400).json({
      message: "Missing required fields: firstName, lastName, profileName",
    });
  }

  try {
    const created = await workers_queries.createWorkerProfile({
      userId: parsedUserId,
      firstName,
      lastName,
      profileName,
      // NEW: pass roleName through (optional)
      roleName: roleName ? String(roleName).trim() : null,
      makePrimary: !!makePrimary,
    });

    res.status(201).json(created);
  } catch (err) {
    // Unique constraint for (user_id, profile_name) will land here
    const msg =
      err && err.code === "23505"
        ? "Profile name already exists for this user"
        : "Internal server error";

    console.error("Error in POST /api/worker-profiles", err);
    res.status(err && err.code === "23505" ? 409 : 500).json({ message: msg });
  }
});

/**
 * Set a worker profile as primary
 * POST /api/worker-profiles/:userId/primary/:workerProfileId
 */
router.post("/worker-profiles/:userId/primary/:workerProfileId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const workerProfileId = parseInt(req.params.workerProfileId, 10);

  if (isNaN(userId) || isNaN(workerProfileId)) {
    return res.status(400).json({ message: "Invalid userId or workerProfileId" });
  }

  try {
    await workers_queries.setPrimaryWorkerProfile(userId, workerProfileId);
    res.status(200).json({ success: true, message: "Primary profile updated" });
  } catch (err) {
    console.error(
      "Error in POST /api/worker-profiles/:userId/primary/:workerProfileId",
      err
    );
    res
      .status(400)
      .json({ success: false, message: err.message || "Failed to set primary profile" });
  }
});

/**
 * =========================
 * Existing routes (cleaned up + fixed)
 * =========================
 */

/**
 * Existing: get a worker's name by user id
 * NOTE: If user has multiple worker profiles, this returns the PRIMARY one.
 * GET /api/worker/:id
 */
router.get("/worker/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const result = await db.query(
      `SELECT first_name, last_name
       FROM workers
       WHERE user_id = $1
       ORDER BY is_primary DESC, id ASC
       LIMIT 1;`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching worker:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-skills", async (req, res) => {
  try {
    const skills = await workers_queries.getAllSkills();
    res.status(200).json(skills);
  } catch (err) {
    console.error("Error in /api/get-all-skills", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-all-experiences", async (req, res) => {
  try {
    const experiences = await workers_queries.getAllExperiences();
    res.status(200).json(experiences);
  } catch (err) {
    console.error("Error in /api/get-all-experiences", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-all-traits", async (req, res) => {
  try {
    const traits = await workers_queries.getAllTraits();
    res.status(200).json(traits);
  } catch (err) {
    console.error("Error in /api/get-all-traits", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * IMPORTANT FIX:
 * Your old code was using req.session.skill_id etc (never set).
 * These endpoints should read from req.body OR params.
 * We'll keep your /:workid/:skillid style endpoints and standardize them.
 */

// Add skill (body)
router.post("/add-worker-skill", async (req, res) => {
  try {
    const { workersId, skillId } = req.body;
    if (!workersId || !skillId)
      return res.status(400).json({ message: "workersId and skillId required" });

    await workers_queries.addWorkerSkill(workersId, skillId);
    res.status(200).json({ success: true, message: "Skill Added" });
  } catch (err) {
    console.error("Error in /api/add-worker-skill", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add skill (params)
router.post("/add-worker-skill-ids/:workid/:skillid", async (req, res) => {
  const workersId = req.params.workid;
  const skillId = req.params.skillid;
  try {
    await workers_queries.addWorkerSkill(workersId, skillId);
    res.status(200).json({ success: true, message: "Skill Added" });
  } catch (err) {
    console.error("Error in /api/add-worker-skill-ids/:workid/:skillid", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clear-worker-skills/:id", async (req, res) => {
  const workersId = req.params.id;
  try {
    const conf = await workers_queries.clearWorkerSkills(workersId);
    res.json(conf);
  } catch (err) {
    console.error("Error in /api/clear-worker-skills/:id", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clear-worker-traits/:id", async (req, res) => {
  const workersId = req.params.id;
  try {
    const conf = await workers_queries.clearWorkerTraits(workersId);
    res.json(conf);
  } catch (err) {
    console.error("Error in /api/clear-worker-traits/:id", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clear-worker-experiences/:id", async (req, res) => {
  const workersId = req.params.id;
  try {
    const conf = await workers_queries.clearWorkerExperiences(workersId);
    res.json(conf);
  } catch (err) {
    console.error("Error in /api/clear-worker-experiences/:id", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get worker skills (by worker profile id) - body/query
router.get("/get-worker-skills", async (req, res) => {
  try {
    const workersId = req.query.workersId || req.body?.workersId;
    if (!workersId) return res.status(400).json({ message: "workersId required" });

    const rows = await workers_queries.getWorkerSkills(workersId);
    res.json(rows);
  } catch (err) {
    console.error("Error in /api/get-worker-skills", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-worker-skills-id/:id", async (req, res) => {
  const workerId = req.params.id;
  try {
    const workerSkills = await workers_queries.getWorkerSkillsWithId(workerId);
    res.json(workerSkills);
  } catch (err) {
    console.error("Error in /api/get-worker-skills-id/:id", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-worker-traits-id/:id", async (req, res) => {
  const workerId = req.params.id;
  try {
    const workerTraits = await workers_queries.getWorkerTraitsWithId(workerId);
    res.json(workerTraits);
  } catch (err) {
    console.error("Error in /api/get-worker-traits-id/:id", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-worker-experiences-id/:id", async (req, res) => {
  const workerId = req.params.id;
  try {
    const workerExp = await workers_queries.getWorkerExperiencesWithId(workerId);
    res.json(workerExp);
  } catch (err) {
    console.error("Error in /api/get-worker-experiences-id/:id", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add experience (body)
router.post("/add-worker-experience", async (req, res) => {
  try {
    const { workersId, experienceId } = req.body;
    if (!workersId || !experienceId)
      return res.status(400).json({ message: "workersId and experienceId required" });

    await workers_queries.addWorkerExperience(workersId, experienceId);
    res.status(200).json({ success: true, message: "Experience Added" });
  } catch (err) {
    console.error("Error in /api/add-worker-experience", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add experience (params)
router.post("/add-worker-experience-ids/:workid/:expid", async (req, res) => {
  const workersId = req.params.workid;
  const expId = req.params.expid;
  try {
    await workers_queries.addWorkerExperience(workersId, expId);
    res.status(200).json({ success: true, message: "Experience Added" });
  } catch (err) {
    console.error("Error in /api/add-worker-experience-ids/:workid/:expid", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get experiences (by worker profile id)
router.get("/get-worker-experiences", async (req, res) => {
  try {
    const workersId = req.query.workersId || req.body?.workersId;
    if (!workersId) return res.status(400).json({ message: "workersId required" });

    const rows = await workers_queries.getWorkerExperiences(workersId);
    res.json(rows);
  } catch (err) {
    console.error("Error in /api/get-worker-experiences", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add trait (body)
router.post("/add-worker-trait", async (req, res) => {
  try {
    const { workersId, traitId } = req.body;
    if (!workersId || !traitId)
      return res.status(400).json({ message: "workersId and traitId required" });

    await workers_queries.addWorkerTrait(workersId, traitId);
    res.status(200).json({ success: true, message: "Trait Added" });
  } catch (err) {
    console.error("Error in /api/add-worker-trait", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add trait (params)
router.post("/add-worker-trait-ids/:workid/:traitid", async (req, res) => {
  const workersId = req.params.workid;
  const traitId = req.params.traitid;
  try {
    await workers_queries.addWorkerTrait(workersId, traitId);
    res.status(200).json({ success: true, message: "Trait Added" });
  } catch (err) {
    console.error("Error in /api/add-worker-trait-ids/:workid/:traitid", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get traits (by worker profile id)
router.get("/get-worker-traits", async (req, res) => {
  try {
    const workersId = req.query.workersId || req.body?.workersId;
    if (!workersId) return res.status(400).json({ message: "workersId required" });

    const rows = await workers_queries.getWorkerTraits(workersId);
    res.json(rows);
  } catch (err) {
    console.error("Error in /api/get-worker-traits", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;