const db = require('../connection.js');
const bcrypt = require('bcryptjs');

const addUser = (email, password, isBusiness, phoneNumber, userImage, locationId) => {
  const query = `INSERT INTO users (email, password, isBusiness, user_phone_number, userImage, active, user_address) VALUES ($1, $2, $3, $4, $5, TRUE, $6) RETURNING *;`;

  return db
    .query(query, [email, password, isBusiness, phoneNumber, userImage, locationId])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding user:", err);
    });
};

// Adds a new worker from registration
const addWorker = (userId, firstName, lastName) => {
  const query = `INSERT INTO workers (user_id, first_name, last_name) VALUES ($1, $2, $3) RETURNING *;`;
  console.log("addWorker() called:", userId, firstName, lastName);


  return db
    .query(query, [userId, firstName, lastName])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding worker:", err);
    });
};

// Adds a new business from registration
const addBusiness = (userId, businessName, businessDescription) => {
  const query = `INSERT INTO businesses (user_id, business_name, business_description) VALUES ($1, $2, $3) RETURNING *;`;
  console.log("addBusiness() called:", userId, businessName, businessDescription);

  return db
    .query(query, [userId, businessName, businessDescription])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding business:", err);
    });
};

// check user credentials for login purposes
const getUserByEmail = (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;

  return db
    .query(query, [email])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error getting user by id:", err);
    });
};

const checkLoginCredentials = (email, password) => {
  return getUserByEmail(email)
    .then((user) => {
      if (!user) {
        // User with provided email does not exist
        return { success: false, message: 'Invalid email or password' };
      }

      if (!user.active) {
        // Account not activated
        console.log(user.active);
        return { success: false, message: 'Account not activated. Please check your email for verification.' };
      }
      // Compare the provided password with the stored hashed password
      return bcrypt.compare(password, user.password).then((match) => {
        if (match) {
          // Passwords match, return the user object
          return { ...user, emailVerified: user.active };
        } else {
          // Passwords do not match
          return null;
        }
      });
    })
    .catch((err) => {
      console.error("Error logging in user:", err);
      return null;
    });
};

const saveVerificationToken = (userId, token) => {
  console.log(`Saving verification token for user ID: ${userId}, Token: ${token}`);
  const query = 'INSERT INTO verification_tokens (user_id, token) VALUES ($1, $2) RETURNING *;';

  return db
    .query(query, [userId, token])
    .then((result) => {
      console.log("Verification token saved:", result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error saving verification token:", err);
      console.error("Error verifying token");
    });
};


const getUserResetToken = (userId) => {
  const query = `SELECT token FROM verification_tokens WHERE user_id = $1;`;

  return db
    .query(query, [userId])
    .then((result) => {
      return result.rows[0] ? result.rows[0].token : null;
    })
    .catch((err) => {
      console.error("Error getting user reset token:", err);
      return null;
    });
};

const deleteUserResetToken = (userId) => {
  const query = `DELETE FROM verification_tokens WHERE user_id = $1;`;

  return db
    .query(query, [userId])
    .then(() => {
      console.log('Reset token deleted successfully');
    })
    .catch((err) => {
      console.error("Error deleting user reset token:", err);
    });
};

const validateToken = async (token) => {
  const result = await db.query('SELECT token FROM verification_tokens where token = $1;', [token]);

  if (result.rows.length > 0) {
    return true;
  }

  return false;
};

const saveUserResetToken = (userId, token) => {
  const query = `INSERT INTO verification_tokens (user_id, token, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP);`;

  return db
    .query(query, [userId, token])
    .then(() => {
      console.log('Reset token saved successfully');
    })
    .catch((err) => {
      console.error("Error saving user reset token:", err);
    });
};

const getUserIdAndToken = async (uniqueIdentifier) => {
  console.log('tokkkken,,,', uniqueIdentifier);
  try {
    const result = await db.query('SELECT user_id FROM verification_tokens WHERE token = $1;', [uniqueIdentifier]);
    // const result = await db.query(`SELECT id, user_id expiration_time FROM verification_tokens WHERE token = $1;`, [token]);

    if (result.rows.length === 0) {
      return null;
    }

    const userId = result.rows[0].user_id;
    const token = result.rows[0].token;

    return { userId, token };
  } catch (error) {
    console.error('Error getting user ID and token:', error);
    return null;
  }
};

const insertOrUpdateToken = async (token) => {
  console.log('insertOrUpdateToken..', token)
  try {
    // Check if the token exists in the verification_tokens table
    const result = await db.query('SELECT user_id FROM verification_tokens WHERE token = $1;', [token]);

    console.log('insertOrUpdateToken rows length: ', result.rows.length);
    if (result.rows.length === 0) {
      // If the token doesn't exist, insert a new record
      const insertResult = await db.query('INSERT INTO verification_tokens (token) VALUES ($1) RETURNING user_id;', [token]);

      const userId = insertResult.rows[0].user_id;
      const id = result.rows[0].id;

      console.log('insertOrUpdateToken rows', insertResult.rows[0]);
      console.log("insertOrUpdateToken -- userId:", userId);

      return insertResult.rows[0].user_id;

    } else {
      // If the token exists, update the existing record
      const updateResult = await db.query('UPDATE verification_tokens SET updated_at = NOW() WHERE token = $1 RETURNING user_id;', [token]);
      return updateResult.rows[0].user_id;
    }
  } catch (error) {
    console.error('Error inserting or updating verification token:', error);
    return null;
  }
};

const verifyEmail = async (token) => {
  console.log('Received token:', token);

  try {
    const result = await db.query(`SELECT id, user_id, expiration_time FROM verification_tokens WHERE token = $1;`, [token]);

    if (result.rows.length === 0) {
      // If the token is not found or has expired, return accordingly
      return { success: false, message: 'Verification token not found.' };
    }

    const userId = result.rows[0].user_id;
    const expiration_time = result.rows[0].expiration_time;
    const id = result.rows[0].id;

    // Check if the token has expired
    if (new Date(expiration_time) < new Date()) {
      // If the token has expired, return accordingly
      return { success: false, message: 'Verification token expired.' };
    }

    // Check if the user is already verified
    const userVerificationStatus = await db.query('SELECT active, email FROM users WHERE id = $1;', [userId]);

    if (userVerificationStatus.rows.length === 0 || userVerificationStatus.rows[0].active) {
      // Delete the verification token from the database
      await db.query('DELETE FROM verification_tokens WHERE token = $1;', [token]);
      return { success: true, message: 'Email is verified.' };
    }


    // Update the users table to set the active status to true
    await db.query('UPDATE users SET active = TRUE WHERE id = $1;', [userId]);
    await db.query('DELETE FROM verification_tokens WHERE token = $1;', [token]);


    return { success: true, message: 'Email verified successfully.', email: userVerificationStatus.rows[0].email };
  } catch (error) {
    console.error('Error during email verification:', error);
    return { success: false, message: 'Internal Server Error' };
  }
};

const updateUserPassword = (userId, newPassword) => {
  const query = 'UPDATE users SET password = $1 WHERE id = $2;';
  return db.query(query, [newPassword, userId]);
};

const getUserById = async (id) => {
  try {
    const result = await db.query(
      `SELECT id, email, isbusiness, userimage AS "userImage" FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error getting user by ID:", err);
    throw err;
  }
};

const getConversationPartners = async (userId) => {
  try {
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
    return result.rows.map(row => row.partner_id); // Return an array of partner IDs
  } catch (error) {
    console.error('Error fetching conversation partners:', error);
    throw error;
  }
};

const getMessageHistory = async (senderId, receiverId) => {
  try {
    const query = `
      SELECT content, sender_id, receiver_id, timestamp
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY timestamp ASC;
    `;

    const result = await db.query(query, [senderId, receiverId]);
    if (result.rows.length === 0) {
      return null; // No messages found
    }
    return result.rows; // Return all messages
  } catch (error) {
    console.error('Error getting message history:', error);
    throw error;
  }
};

const sendMessage = async (senderId, receiverId, content) => {
  try {
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content, timestamp)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const result = await db.query(query, [senderId, receiverId, content]);
    return result.rows[0]; // Return the inserted message
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

const getLatestMessages = async (userId) => {
  try {
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
    return result.rows; // Return the latest messages
  } catch (error) {
    console.error('Error fetching latest messages:', error);
    throw error;
  }
};

const getUserDetails = async (userId) => {
  try {
    // Check if the user is in the workers table
    const workerQuery = `
      SELECT first_name, last_name 
      FROM workers 
      WHERE user_id = $1;
    `;
    const workerResult = await db.query(workerQuery, [userId]);

    if (workerResult.rows.length > 0) {
      // User is a worker
      return {
        type: 'worker',
        firstName: workerResult.rows[0].first_name,
        lastName: workerResult.rows[0].last_name,
      };
    }

    // Check if the user is in the businesses table
    const businessQuery = `
      SELECT business_name 
      FROM businesses 
      WHERE user_id = $1;
    `;
    const businessResult = await db.query(businessQuery, [userId]);

    if (businessResult.rows.length > 0) {
      // User is a business
      return {
        type: 'business',
        businessName: businessResult.rows[0].business_name,
      };
    }

    // User is not found in either table
    return { type: 'unknown', message: 'User not found in workers or businesses table' };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

module.exports = {
  addUser,
  addWorker,
  addBusiness,
  getUserByEmail,
  checkLoginCredentials,
  saveVerificationToken,
  getUserResetToken,
  deleteUserResetToken,
  saveUserResetToken,
  updateUserPassword,
  getUserIdAndToken,
  verifyEmail,
  validateToken,
  getUserById,
  insertOrUpdateToken,
  getConversationPartners,
  getMessageHistory,
  sendMessage,
  getLatestMessages,
  getUserDetails,
};
