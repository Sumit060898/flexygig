const express = require('express');
const router = express.Router();
const workers_queries = require("../queries/workers_queries.js");
const db = require('../connection.js');

router.get('/gig-workers', (req, res) => {
  workers_queries.fetchWorkers()
    .then((workers) => {
      console.log(workers);
      res.json(workers);
      return;
    });
});

router.get('/worker/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" }); // ✅ Early return if bad input
  }

  try {
    const result = await db.query(
      `SELECT first_name, last_name FROM workers WHERE user_id = $1`,
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

router.get('/get-all-skills', async (req, res) => {
  try {
    const skills = await workers_queries.getAllSkills();
    res.status(200).json(skills);
  } catch (err) {
    console.error("Error in /api/get-all-skills", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/get-all-experiences', async (req, res) => {
  try {
    const experiences = await workers_queries.getAllExperiences();
    res.status(200).json(experiences);
  } catch (err) {
    console.error("Error in /api/get-all-experiences", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/get-all-traits', async (req, res) => {
  try {
    const traits = await workers_queries.getAllTraits();
    res.status(200).json(traits);
  } catch (err) {
    console.error("Error in /api/get-all-traits", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-worker-skill", async (req, res) => {
  try {
    const workersId = req.session.workers_id;
    const skillId = req.session.skill_id;
    await workers_queries.addWorkerSkill(workersId, skillId);
    res.status(200).json({ success: true, message: 'Skill Added' });
  } catch (err) {
    console.error("Error in /api/add-worker-skill", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-worker-skill-ids/:workid/:skillid", async (req, res) => {
  const workersId = req.params.workid;
  const skillId = req.params.skillid;
  try {
    await workers_queries.addWorkerSkill(workersId, skillId);
    res.status(200).json({ success: true, message: 'Skill Added' });
  } catch (err) {
    console.error("Error in /api/add-worker-skill", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clear-worker-skills/:id", async (req, res) => {
  const workersId = req.params.id;

  workers_queries.clearWorkerSkills(workersId)
    .then((conf) => {
      res.json(conf);
      return;
    });
});

router.post("/clear-worker-traits/:id", async (req, res) => {
  const workersId = req.params.id;

  workers_queries.clearWorkerTraits(workersId)
    .then((conf) => {
      res.json(conf);
      return;
    });
});

router.post("/clear-worker-experiences/:id", async (req, res) => {
  const workersId = req.params.id;

  workers_queries.clearWorkerExperiences(workersId)
    .then((conf) => {
      res.json(conf);
      return;
    });
});

router.get("/get-worker-skills", async (req, res) => {
  try {
    const workersId = req.session.workers_id;
    const { rows } = await workers_queries.getWorkerSkills(workersId);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /api/get-worker-skills", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-worker-skills-id/:id", (req, res) => {
  const workerId = req.params.id;

  workers_queries.getWorkerSkillsWithId(workerId)
    .then((workerSkills) => {
      res.json(workerSkills);
      return;
    });
});

router.get("/get-worker-traits-id/:id", (req, res) => {
  const workerId = req.params.id;

  workers_queries.getWorkerTraitsWithId(workerId)
    .then((workerTraits) => {
      res.json(workerTraits);
      return;
    });
});

router.get("/get-worker-experiences-id/:id", (req, res) => {
  const workerId = req.params.id;

  workers_queries.getWorkerExperiencesWithId(workerId)
    .then((workerExp) => {
      res.json(workerExp);
      return;
    });
});

router.post("/add-worker-experience", async (req, res) => {
  try {
    const workersId = req.session.workers_id;
    const experienceId = req.session.experience_id;
    await workers_queries.addWorkerExperience(workersId, experienceId);
    res.status(200).json({ success: true, message: 'Experience Added' });
  } catch (err) {
    console.error("Error in /api/add-worker-experience", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-worker-experience-ids/:workid/:expid", async (req, res) => {
  const workersId = req.params.workid;
  const expId = req.params.expid;
  try {
    await workers_queries.addWorkerExperience(workersId, expId);
    res.status(200).json({ success: true, message: 'Experience Added' });
  } catch (err) {
    console.error("Error in /api//add-worker-experience/:workid/:expid", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-worker-experiences", async (req, res) => {
  try {
    const workersId = req.session.workers_id;
    const { rows } = await workers_queries.getWorkerExperiences(workersId);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /api/get-worker-experiences", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-worker-trait", async (req, res) => {
  try {
    const workersId = req.session.workers_id;
    const traitId = req.session.trait_id;
    await workers_queries.addWorkerTrait(workersId, traitId);
    res.status(200).json({ success: true, message: 'Trait Added' });
  } catch (err) {
    console.error("Error in /api/add-worker-trait", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add-worker-trait-ids/:workid/:traitid", async (req, res) => {
  const workersId = req.params.workid;
  const traitId = req.params.traitid;
  try {
    await workers_queries.addWorkerTrait(workersId, traitId);
    res.status(200).json({ success: true, message: 'Trait Added' });
  } catch (err) {
    console.error("Error in /api/add-worker-trait/:workid/:traitid", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-worker-traits", async (req, res) => {
  try {
    const workersId = req.session.workers_id;
    const { rows } = await workers_queries.getWorkerTraits(workersId);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /api/get-worker-traits", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;