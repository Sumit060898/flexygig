const db = require('../connection.js');

const checkWorkerProfile = async (userId) => {
  try {
    const userProfile = await db.query(`SELECT id FROM workers WHERE user_id = $1;`, [userId]);
    return userProfile.rows[0]; // Assuming userId is unique, so returning the first row
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    throw error;
  }
};

const checkBusinessProfile = async (userId) => {
  try {
    const userProfile = await db.query(`SELECT id FROM businesses WHERE user_id = $1;`, [userId]);
    return userProfile.rows[0]; // Assuming userId is unique, so returning the first row
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    throw error;
  }
};

const addUserProfile = (userId, worker) => {

  const query = `INSERT INTO workers (user_id, biography, worker_phone_number, worker_street_address, worker_city, worker_province, worker_postal_code, desired_work_radius, skills, desired_pay) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;

  return db
    .query(query, [userId, worker.biography, worker.phone_number, worker.street_address, worker.city, worker.province, worker.postal_code, worker.desired_work_radius, worker.skills, worker.desired_pay])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding user profile:", err);
    });
};

const getBusinessProfile = (user_id) => {
  //const query = `SELECT * FROM businesses where user_id = $1`;
  const query = `SELECT users.id,
  users.email,
  users.active,
  users.signUpDate,
  users.user_phone_number AS phone_number,
  businesses.business_name,
  businesses.business_description,
  businesses.business_website,
  locations.streetaddress AS street_address,
  locations.city,
  locations.province,
  locations.postalcode AS postal_code
FROM users
JOIN businesses ON users.id = businesses.user_id
JOIN locations ON users.user_address = locations.location_id
WHERE users.id = $1;`;

  return db.query(query, [user_id])
    .then((result) => {
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.error("Error checking business profile:", err);
    });
};

const addBusinessProfile = (userId, business) => {

  const query = `INSERT INTO businesses (user_id, business_name, business_description, business_phone_number, business_email, business_street_address, business_city, business_province, business_postal_code, business_website) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;

  return db
    .query(query, [userId, business.name, business.description, business.phone_number, business.email, business.street_address, business.city, business.province, business.postal_code, business.website])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding user profile:", err);
    });
};

const updateBusinessProfile = (business) => {

  const query = `UPDATE businesses SET
    business_name = $1,
    business_description = $2,
    business_phone_number = $3,
    business_email = $4,
    business_street_address = $5,
    business_city = $6,
    business_province = $7,
    business_postal_code = $8,
    business_website = $9
    where id = $10 RETURNING *;`;
  return db
    .query(query, [business.name, business.description, business.phone_number, business.email, business.street_address, business.city, business.province, business.postal_code, business.website, business.id])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error updating profile: ", err);
    });

};

const updateUserProfile = async (userId, worker) => {
  try {
    // Update the workers table and retrieve the updated row
    const updatedWorker = await db.query(
      `UPDATE workers
       SET biography = $2,
           worker_phone_number = $3,
           worker_street_address = $4,
           worker_city = $5,
           worker_province = $6,
           worker_postal_code = $7,
           desired_work_radius = $8,
           skills = $9,
           desired_pay = $10
       WHERE user_id = $1
       RETURNING *;`, // Return updated row
      [userId, worker.biography, worker.phone_number, worker.street_address, worker.city, worker.province, worker.postal_code, worker.desired_work_radius, worker.skills, worker.desired_pay]
    );

    // Update the users table and retrieve the updated row
    const updatedUser = await db.query(
      `UPDATE users
       SET firstname = $2,
           lastname = $3
       WHERE id = $1
       RETURNING *;`, // Return updated row
      [userId, worker.firstname, worker.lastname]
    );

    // Return the updated worker and user data
    return updatedWorker.rows[0];
  } catch (error) {
    console.error("Error updating profile: ", error);
    throw error;
  }
};

const getProfile = (userId) => {
  const query = `SELECT users.id,
  users.email,
  users.active,
  users.signUpDate,
  users.user_phone_number AS phone_number,
  workers.first_name AS firstname,
  workers.last_name AS lastname,
  workers.biography,
  workers.desired_work_radius,
  workers.desired_pay,
  locations.streetaddress AS street_address,
  locations.city,
  locations.province,
  locations.postalcode AS postal_code
FROM users
JOIN workers ON users.id = workers.user_id
JOIN locations ON users.user_address = locations.location_id
WHERE users.id = $1;`;

  return db
    .query(query, [userId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error retrieving user profile information: ", err);
    });
};


module.exports = {
  checkWorkerProfile,
  addUserProfile,
  updateUserProfile,
  getProfile,
  checkBusinessProfile,
  addBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile
};