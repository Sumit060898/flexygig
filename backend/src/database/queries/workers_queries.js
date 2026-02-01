const db = require('../connection.js');

const fetchWorkers = () => {
  const query = "SELECT * FROM workers"

  return db
    .query(query)
    .then((result) => {
      return result.rows
    })
    .catch((err) => {
      console.error("Error fetching workers:", err);
    });
}

const getAllSkills = () => {
  const query = "SELECT * FROM skills";

  return db
    .query(query)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting all skills:", err);
    });
}

const getAllExperiences = () => {
  const query = "SELECT * FROM experiences";

  return db
    .query(query)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting all experiences:", err);
    });
}

const getAllTraits = () => {
  const query = "SELECT * FROM traits";

  return db
    .query(query)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting all traits:", err);
    });
}

// Accociates a selected skill to the user
const addWorkerSkill = (workersId, skillId) => {
  const query = `INSERT INTO workers_skills (workers_id, skill_id) VALUES ($1, $2) RETURNING *;`;
  console.log("addWorkerSkill() called:", workersId, skillId);

  return db
    .query(query, [workersId, skillId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding worker skill:", err);
    });
};

// Clears all skills from a user
const clearWorkerSkills = (workersId) => {
  const query = `DELETE FROM workers_skills WHERE workers_id = $1;`;
  console.log("clearWorkerSkills() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.error("Error clearing worker skills:", err);
    });
};

// Clears all traits from a user
const clearWorkerTraits = (workersId) => {
  const query = `DELETE FROM workers_traits WHERE workers_id = $1;`;
  console.log("clearWorkerTraits() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.error("Error clearing worker traits:", err);
    });
};

// Clears all experiences from a user
const clearWorkerExperiences = (workersId) => {
  const query = `DELETE FROM workers_experiences WHERE workers_id = $1;`;
  console.log("clearWorkerExperiences() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.error("Error clearing worker experiences:", err);
    });
};

// Get all skills of a specified user
const getWorkerSkills = (workersId) => {
  const query = `SELECT workers_id, skill_name FROM workers INNER JOIN workers_skills ON workers.id = workers_skills.workers_id INNER JOIN skills ON workers_skills.skill_id = skills.skill_id WHERE workers_id=$1;`;
  console.log("getWorkerSkills() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting worker skills:", err);
    });
}

// As above, but with the skills' id, not the user (for adding and removing skills)
const getWorkerSkillsWithId = (workersId) => {
  const query = `SELECT skills.skill_id, skill_name FROM workers INNER JOIN workers_skills ON workers.id = workers_skills.workers_id INNER JOIN skills ON workers_skills.skill_id = skills.skill_id WHERE workers_id=$1;`;
  console.log("getWorkerSkills() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting worker skills:", err);
    });
}

// Accociates a selected experience to the user
const addWorkerExperience = (workersId, experienceId) => {
  const query = `INSERT INTO workers_experiences (workers_id, experience_id) VALUES ($1, $2) RETURNING *;`;
  console.log("addWorkerExperience() called:", workersId, experienceId);

  return db
    .query(query, [workersId, experienceId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding worker experience:", err);
    });
};

// Get all experiences of a specified user
const getWorkerExperiences = (workersId) => {
  const query = `SELECT workers_id, experience_name FROM workers INNER JOIN workers_experiences ON workers.id = workers_experiences.workers_id INNER JOIN experiences ON workers_experiences.experience_id = experiences.experience_id WHERE workers_id=$1;`;
  console.log("getWorkerExperiences() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error getting worker experiences:", err);
    });
}

// As above, but with the experiences' id, not the user (for adding and removing experience)
const getWorkerExperiencesWithId = (workersId) => {
  const query = `SELECT experiences.experience_id, experience_name FROM workers INNER JOIN workers_experiences ON workers.id = workers_experiences.workers_id INNER JOIN experiences ON workers_experiences.experience_id = experiences.experience_id WHERE workers_id=$1;`;
  console.log("getWorkerExperiences() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting worker experiences:", err);
    });
}

// Accociates a selected trait to the user
const addWorkerTrait = (workersId, traitId) => {
  const query = `INSERT INTO workers_traits (workers_id, trait_id) VALUES ($1, $2) RETURNING *;`;
  console.log("addWorkerTrait() called:", workersId, traitId);

  return db
    .query(query, [workersId, traitId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding worker trait:", err);
    });
};

// Get all traits of a specified user
const getWorkerTraits = (workersId) => {
  const query = `SELECT workers_id, trait_name FROM workers INNER JOIN workers_traits ON workers.id = workers_traits.workers_id INNER JOIN traits ON workers_traits.trait_id = traits.trait_id WHERE workers_id=$1;`;
  console.log("getWorkerTraits() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error getting worker traits:", err);
    });
}

// As above, but with the traits' id, not the user (for adding and removing traits)
const getWorkerTraitsWithId = (workersId) => {
  const query = `SELECT traits.trait_id, trait_name FROM workers INNER JOIN workers_traits ON workers.id = workers_traits.workers_id INNER JOIN traits ON workers_traits.trait_id = traits.trait_id WHERE workers_id=$1;`;
  console.log("getWorkerTraits() called:", workersId);

  return db
    .query(query, [workersId])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error getting worker skills:", err);
    });
}

module.exports = {
  fetchWorkers,
  getAllSkills,
  getAllExperiences,
  getAllTraits,
  addWorkerSkill,
  clearWorkerSkills,
  clearWorkerTraits,
  clearWorkerExperiences,
  getWorkerSkills,
  getWorkerSkillsWithId,
  addWorkerExperience,
  getWorkerExperiences,
  getWorkerExperiencesWithId,
  addWorkerTrait,
  getWorkerTraits,
  getWorkerTraitsWithId
}