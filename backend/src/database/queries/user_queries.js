const db = require('../connection.js');
const bcrypt = require('bcryptjs');

/**
 * Users
 */
const addUser = (email, password, isBusiness, phoneNumber, userImage, locationId) => {
  const query = `
    INSERT INTO users (email, password, isBusiness, user_phone_number, userImage, active, user_address)
    VALUES ($1, $2, $3, $4, $5, TRUE, $6)
    RETURNING *;
  `;

  return db
    .query(query, [email, password, isBusiness, phoneNumber, userImage, locationId])
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error("Error adding user:", err);
      throw err;
    });
};

/**
 * WORKERS (multiple profiles per user)
 * profileName defaults to 'Default'
 * makePrimary defaults to false
 */
const addWorker = async (userId, firstName, lastName, profileName = 'Default', makePrimary = false) => {
  try {
    // If makePrimary true, clear any existing primary for this user
    if (makePrimary) {
      await db.query(`UPDATE workers SET is_primary = false WHERE user_id = $1;`, [userId]);
    }

    const query = `
      INSERT INTO workers (user_id, first_name, last_name, profile_name, is_primary, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const result = await db.query(query, [userId, firstName, lastName, profileName, !!makePrimary]);
    return result.rows[0];
  } catch (err) {
    console.error("Error adding worker profile:", err);
    throw err;
  }
};

const getWorkerProfilesByUserId = async (userId) => {
  try {
    const query = `
      SELECT *
      FROM workers
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at ASC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching worker profiles by userId:", err);
    throw err;
  }
};

const getPrimaryWorkerProfile = async (userId) => {
  try {
    const query = `
      SELECT *
      FROM workers
      WHERE user_id = $1 AND is_primary = true
      LIMIT 1;
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("Error fetching primary worker profile:", err);
    throw err;
  }
};

const getWorkerProfileById = async (workerId) => {
  try {
    const query = `SELECT * FROM workers WHERE id = $1;`;
    const result = await db.query(query, [workerId]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("Error fetching worker profile by id:", err);
    throw err;
  }
};

const setPrimaryWorkerProfile = async (userId, workerId) => {
  try {
    await db.query('BEGIN');

    // Clear current primary
    await db.query(`UPDATE workers SET is_primary = false WHERE user_id = $1;`, [userId]);

    // Set new primary
    const update = await db.query(
      `UPDATE workers
       SET is_primary = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *;`,
      [workerId, userId]
    );

    await db.query('COMMIT');
    return update.rows[0] || null;
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("Error setting primary worker profile:", err);
    throw err;
  }
};

const deleteWorkerProfile = async (userId, workerId) => {
  try {
    // Check if the profile is primary
    const current = await db.query(
      `SELECT id, is_primary FROM workers WHERE id = $1 AND user_id = $2;`,
      [workerId, userId]
    );

    if (current.rows.length === 0) return { deleted: false, reason: 'not_found' };

    const wasPrimary = current.rows[0].is_primary;

    await db.query(`DELETE FROM workers WHERE id = $1 AND user_id = $2;`, [workerId, userId]);

    // If it was primary, set another profile as primary if exists
    if (wasPrimary) {
      const next = await db.query(
        `SELECT id FROM workers WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1;`,
        [userId]
      );

      if (next.rows.length > 0) {
        await db.query(`UPDATE workers SET is_primary = true WHERE id = $1;`, [next.rows[0].id]);
      }
    }

    return { deleted: true, wasPrimary };
  } catch (err) {
    console.error("Error deleting worker profile:", err);
    throw err;
  }
};

/**
 * BUSINESSES
 */
const addBusiness = (userId, businessName, businessDescription) => {
  const query = `
    INSERT INTO businesses (user_id, business_name, business_description)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  return db
    .query(query, [userId, businessName, businessDescription])
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error("Error adding business:", err);
      throw err;
    });
};

/**
 * AUTH / LOGIN
 */
const getUserByEmail = (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;

  return db
    .query(query, [email])
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error("Error getting user by email:", err);
      throw err;
    });
};

const checkLoginCredentials = (email, password) => {
  return getUserByEmail(email)
    .then((user) => {
      if (!user) return null;

      if (!user.active) {
        return { success: false, message: 'Account not activated. Please check your email for verification.' };
      }

      return bcrypt.compare(password, user.password).then((match) => {
        if (!match) return null;
        return { ...user, emailVerified: user.active };
      });
    })
    .catch((err) => {
      console.error("Error logging in user:", err);
      return null;
    });
};

/**
 * VERIFICATION TOKENS (email verification)
 * Table assumed: verification_tokens(user_id, token, updated_at, expiration_time?)
 */

const saveVerificationToken = async (userId, token) => {
  try {
    // Clean old token rows for this user (optional but prevents clutter)
    await db.query(`DELETE FROM verification_tokens WHERE user_id = $1;`, [userId]);

    const query = `
      INSERT INTO verification_tokens (user_id, token, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const result = await db.query(query, [userId, token]);
    return result.rows[0];
  } catch (err) {
    console.error("Error saving verification token:", err);
    throw err;
  }
};

const validateToken = async (token) => {
  const result = await db.query(`SELECT token FROM verification_tokens WHERE token = $1;`, [token]);
  return result.rows.length > 0;
};

/**
 * Upsert token by userId (THIS FIXES your broken insertOrUpdateToken)
 */
const insertOrUpdateToken = async (userId, token) => {
  try {
    const existing = await db.query(`SELECT user_id FROM verification_tokens WHERE user_id = $1;`, [userId]);

    if (existing.rows.length === 0) {
      const insert = await db.query(
        `INSERT INTO verification_tokens (user_id, token, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING user_id;`,
        [userId, token]
      );
      return insert.rows[0].user_id;
    } else {
      const update = await db.query(
        `UPDATE verification_tokens
         SET token = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING user_id;`,
        [userId, token]
      );
      return update.rows[0].user_id;
    }
  } catch (error) {
    console.error('Error inserting or updating verification token:', error);
    throw error;
  }
};

const verifyEmail = async (token) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, expiration_time
       FROM verification_tokens
       WHERE token = $1;`,
      [token]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Verification token not found.' };
    }

    const userId = result.rows[0].user_id;
    const expiration_time = result.rows[0].expiration_time;

    // If expiration_time exists, enforce it
    if (expiration_time && new Date(expiration_time) < new Date()) {
      await db.query('DELETE FROM verification_tokens WHERE token = $1;', [token]);
      return { success: false, message: 'Verification token expired.' };
    }

    const userResult = await db.query('SELECT active, email FROM users WHERE id = $1;', [userId]);
    if (userResult.rows.length === 0) {
      await db.query('DELETE FROM verification_tokens WHERE token = $1;', [token]);
      return { success: false, message: 'User not found.' };
    }

    if (userResult.rows[0].active) {
      await db.query('DELETE FROM verification_tokens WHERE token = $1;', [token]);
      return { success: true, message: 'Email already verified.', email: userResult.rows[0].email };
    }

    await db.query('UPDATE users SET active = TRUE WHERE id = $1;', [userId]);
    await db.query('DELETE FROM verification_tokens WHERE token = $1;', [token]);

    return { success: true, message: 'Email verified successfully.', email: userResult.rows[0].email };
  } catch (error) {
    console.error('Error during email verification:', error);
    return { success: false, message: 'Internal Server Error' };
  }
};

/**
 * PASSWORD RESET (still using verification_tokens in your project)
 * If you want a separate password_reset_tokens table later, tell me.
 */
const getUserResetToken = async (userId) => {
  const query = `SELECT token FROM verification_tokens WHERE user_id = $1;`;
  const result = await db.query(query, [userId]);
  return result.rows[0] ? result.rows[0].token : null;
};

const deleteUserResetToken = async (userId) => {
  const query = `DELETE FROM verification_tokens WHERE user_id = $1;`;
  await db.query(query, [userId]);
};

const saveUserResetToken = async (userId, token) => {
  // overwrite any old token row for this user
  await db.query(`DELETE FROM verification_tokens WHERE user_id = $1;`, [userId]);

  const query = `
    INSERT INTO verification_tokens (user_id, token, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP);
  `;
  await db.query(query, [userId, token]);
};

const getUserIdAndToken = async (uniqueIdentifier) => {
  try {
    const result = await db.query(
      `SELECT user_id, token
       FROM verification_tokens
       WHERE token = $1;`,
      [uniqueIdentifier]
    );

    if (result.rows.length === 0) return null;

    return { userId: result.rows[0].user_id, token: result.rows[0].token };
  } catch (error) {
    console.error('Error getting user ID and token:', error);
    return null;
  }
};

const updateUserPassword = (userId, newPassword) => {
  const query = 'UPDATE users SET password = $1 WHERE id = $2;';
  return db.query(query, [newPassword, userId]);
};

/**
 * USER FETCH
 */
const getUserById = async (id) => {
  const result = await db.query(
    `SELECT id, email, isbusiness, userimage AS "userImage", active
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

/**
 * MESSAGING
 */
const getConversationPartners = async (userId) => {
  const query = `
    SELECT DISTINCT
      CASE
        WHEN sender_id = $1 THEN receiver_id
        WHEN receiver_id = $1 THEN sender_id
      END AS partner_id
    FROM messages
    WHERE sender_id = $1 OR receiver_id = $1;
  `;
  const result = await db.query(query, [userId]);
  return result.rows.map(row => row.partner_id);
};

const getMessageHistory = async (senderId, receiverId) => {
  const query = `
    SELECT content, sender_id, receiver_id, timestamp
    FROM messages
    WHERE (sender_id = $1 AND receiver_id = $2)
       OR (sender_id = $2 AND receiver_id = $1)
    ORDER BY timestamp ASC;
  `;
  const result = await db.query(query, [senderId, receiverId]);
  return result.rows.length ? result.rows : null;
};

const sendMessage = async (senderId, receiverId, content) => {
  const query = `
    INSERT INTO messages (sender_id, receiver_id, content, timestamp)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const result = await db.query(query, [senderId, receiverId, content]);
  return result.rows[0];
};

const getLatestMessages = async (userId) => {
  const query = `
    SELECT
      m.message_id AS message_id,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.timestamp
    FROM messages m
    WHERE m.receiver_id = $1
    ORDER BY m.timestamp DESC
    LIMIT 4;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

/**
 * User Details
 * IMPORTANT change:
 * If a worker has multiple profiles, this returns the PRIMARY one.
 */
const getUserDetails = async (userId) => {
  try {
    // Worker primary profile
    const workerQuery = `
      SELECT first_name, last_name, profile_name
      FROM workers
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1;
    `;
    const workerResult = await db.query(workerQuery, [userId]);

    if (workerResult.rows.length > 0) {
      return {
        type: 'worker',
        firstName: workerResult.rows[0].first_name,
        lastName: workerResult.rows[0].last_name,
        profileName: workerResult.rows[0].profile_name
      };
    }

    // Business
    const businessQuery = `
      SELECT business_name
      FROM businesses
      WHERE user_id = $1;
    `;
    const businessResult = await db.query(businessQuery, [userId]);

    if (businessResult.rows.length > 0) {
      return {
        type: 'business',
        businessName: businessResult.rows[0].business_name,
      };
    }

    return { type: 'unknown', message: 'User not found in workers or businesses table' };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

module.exports = {
  // users
  addUser,
  getUserByEmail,
  getUserById,

  // workers profiles
  addWorker,
  getWorkerProfilesByUserId,
  getPrimaryWorkerProfile,
  getWorkerProfileById,
  setPrimaryWorkerProfile,
  deleteWorkerProfile,

  // businesses
  addBusiness,

  // auth/login
  checkLoginCredentials,

  // verification tokens
  saveVerificationToken,
  validateToken,
  insertOrUpdateToken,
  verifyEmail,

  // password reset (reusing verification_tokens)
  getUserResetToken,
  deleteUserResetToken,
  saveUserResetToken,
  getUserIdAndToken,
  updateUserPassword,

  // messaging
  getConversationPartners,
  getMessageHistory,
  sendMessage,
  getLatestMessages,

  // user details
  getUserDetails,
};