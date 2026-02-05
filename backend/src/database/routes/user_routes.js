// src/database/routes/user_routes.js
const express = require('express');
const db = require('../connection.js');
const router = express.Router();
const user_queries = require('../queries/user_queries.js'); // still used for user helpers
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const workers_queries = require('../queries/workers_queries.js'); // still used for skill/trait helpers
require('dotenv').config();

/**
 * SendGrid (HTTP API)
 * Required env vars on Render:
 *   SENDGRID_API_KEY, EMAIL_FROM, FRONTEND_URL
 */
const sgMail = require('@sendgrid/mail');

if (!process.env.SENDGRID_API_KEY) {
  console.warn('Warning: SENDGRID_API_KEY is not set. Emails will not send.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function getFrontendUrl() {
  const url = process.env.FRONTEND_URL || process.env.REACT_APP_FRONTEND_URL || '';
  return url.replace(/\/$/, '');
}

async function sendVerificationEmail(email, token) {
  const frontendUrl = getFrontendUrl();
  // Frontend route expects /verify/:token which calls backend GET /api/verify/:token
  const verifyLink = `${frontendUrl}/verify/${token}`;

  if (!process.env.SENDGRID_API_KEY) return false;

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Verify your FlexyGig account',
      html: `
        <p>Thanks for signing up!</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>If the link doesn't work, copy-paste the URL into your browser.</p>
      `,
    });

    console.log('Verification email sent to:', email);
    return true;
  } catch (err) {
    console.error('Error sending verification email:', err?.response?.body || err);
    return false;
  }
}

async function sendPasswordResetEmail(email, resetToken) {
  const frontendUrl = getFrontendUrl();
  const resetLink = `${frontendUrl}/password-reset/${resetToken}`;

  if (!process.env.SENDGRID_API_KEY) return false;

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'FlexyGig - Password Reset',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    console.log('Password reset email sent to:', email);
    return true;
  } catch (err) {
    console.error('Error sending password reset email:', err?.response?.body || err);
    return false;
  }
}

/**
 * Utility: create worker profile row
 * Returns the inserted worker row.
 */
async function createWorkerProfile(userId, firstName, lastName, profileName = 'Default', isPrimary = false) {
  const client = db;
  const insertQuery = `
    INSERT INTO workers (user_id, first_name, last_name, profile_name, is_primary, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [userId, firstName || '', lastName || '', profileName || 'Default', !!isPrimary];
  const { rows } = await client.query(insertQuery, values);
  return rows[0];
}

/**
 * Ensure only one primary profile per user.
 * Marks all other profiles for user as is_primary = false, then sets the target workerId to true.
 */
async function setPrimaryProfile(userId, workerId) {
  const client = db;
  try {
    await client.query('BEGIN');
    await client.query('UPDATE workers SET is_primary = false WHERE user_id = $1;', [userId]);
    const { rows } = await client.query('UPDATE workers SET is_primary = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *;', [workerId, userId]);
    await client.query('COMMIT');
    return rows[0] || null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

/**
 * register (direct insert into users) + create default worker profile (if Worker)
 */
router.post('/register', async (req, res) => {
  const {
    email,
    password,
    accountType,
    phone_number,
    photo,
    firstName,
    lastName,
    businessName,
    businessDescription,
  } = req.body;

  if (!email || !password || !accountType) {
    res.status(400).send('Invalid credentials');
    return;
  }

  try {
    const foundUser = await user_queries.getUserByEmail(email);
    if (foundUser) {
      res.status(400).send('Email already exists');
      return;
    }

    let isBusiness = '';
    if (accountType === 'Worker') isBusiness = 'false';
    else if (accountType === 'Employer') isBusiness = 'true';

    const hashedPassword = bcrypt.hashSync(password, 10);
    // add user using existing helper
    const user = await user_queries.addUser(email, hashedPassword, isBusiness, phone_number, photo);

    // create a default worker profile row if accountType Worker
    if (accountType === 'Worker') {
      // create profile_name = 'Default' and make it primary
      const workerRow = await createWorkerProfile(user.id, firstName, lastName, 'Default', true);
      console.log('Created default worker profile:', workerRow.id);
    } else if (accountType === 'Employer') {
      // use existing helper for business table
      await user_queries.addBusiness(user.id, businessName, businessDescription);
    }

    const verificationToken = crypto.randomBytes(64).toString('hex');
    await user_queries.saveVerificationToken(user.id, verificationToken);

    const updatedUser = await user_queries.getUserById(user.id);

    res.status(200).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: updatedUser,
    });

    // async email send
    sendVerificationEmail(email, verificationToken).then((ok) => {
      if (!ok) console.error(`Failed to send verification email to ${email}`);
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    if (!res.headersSent) res.status(500).send('Internal Server Error');
  }
});

/**
 * pending-register (recommended)
 * - Creates pending_users row and sends verification email.
 */
router.post('/pending-register', async (req, res) => {
  const {
    email,
    password,
    accountType,
    firstName,
    lastName,
    businessName,
    businessDescription,
    phone_number,
    photo,
    street_address,
    city,
    province,
    postal_code,
    skills,
    experiences,
    traits,
  } = req.body;

  if (!email || !password || !accountType) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const existingUser = await user_queries.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const pendingResult = await db.query('SELECT * FROM pending_users WHERE email = $1;', [email]);
    if (pendingResult.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email is already pending verification.' });
    }

    const token = crypto.randomBytes(64).toString('hex');
    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.query(
      `
      INSERT INTO pending_users
        (email, password, account_type, first_name, last_name, business_name, business_description, phone_number, photo, token, street_address, city, province, postal_code, skills, experiences, traits)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    `,
      [
        email,
        hashedPassword,
        accountType,
        firstName,
        lastName,
        businessName,
        businessDescription,
        phone_number,
        photo,
        token,
        street_address,
        city,
        province,
        postal_code,
        JSON.stringify(skills),
        JSON.stringify(experiences),
        JSON.stringify(traits),
      ]
    );

    // respond first
    res.status(200).json({ message: 'Please check your email to complete registration.' });

    // send email async
    sendVerificationEmail(email, token).then((ok) => {
      if (!ok) console.error(`Failed to send pending verification email to ${email}`);
    });
  } catch (error) {
    console.error('Error creating pending user:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * verify (pending_users flow)
 * Frontend should call GET /api/verify/:token to complete verification
 */
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const result = await db.query('SELECT * FROM pending_users WHERE token = $1;', [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired token' });
    }

    const pending = result.rows[0];

    const existingUser = await user_queries.getUserByEmail(pending.email);
    if (existingUser) {
      await db.query('DELETE FROM pending_users WHERE token = $1;', [token]);
      return res.status(400).json({ message: 'User already verified' });
    }

    const locationResult = await db.query(
      `
      INSERT INTO locations (StreetAddress, city, province, postalCode)
      VALUES ($1, $2, $3, $4)
      RETURNING location_id;
    `,
      [pending.street_address, pending.city, pending.province, pending.postal_code]
    );

    const locationId = locationResult.rows[0].location_id;

    // create user
    const user = await user_queries.addUser(
      pending.email,
      pending.password,
      pending.account_type === 'Employer',
      pending.phone_number,
      pending.photo,
      locationId
    );

    // create worker profile (if worker)
    if (pending.account_type === 'Worker') {
      // create worker profile row and mark as primary if none exist
      const workerRow = await createWorkerProfile(user.id, pending.first_name, pending.last_name, 'Default', true);

      // insert skills/experiences/traits if present
      const skillsParsed = typeof pending.skills === 'string' ? JSON.parse(pending.skills) : pending.skills;
      for (const skill of skillsParsed || []) {
        // workers_queries.addWorkerSkill expects workersId, skillId
        await workers_queries.addWorkerSkill(workerRow.id, skill.skill_id);
      }

      const expParsed = typeof pending.experiences === 'string' ? JSON.parse(pending.experiences) : pending.experiences;
      for (const experience of expParsed || []) {
        await workers_queries.addWorkerExperience(workerRow.id, experience.experience_id);
      }

      const traitsParsed = typeof pending.traits === 'string' ? JSON.parse(pending.traits) : pending.traits;
      for (const trait of traitsParsed || []) {
        await workers_queries.addWorkerTrait(workerRow.id, trait.trait_id);
      }
    } else {
      await user_queries.addBusiness(user.id, pending.business_name, pending.business_description || '');
    }

    await db.query('DELETE FROM pending_users WHERE token = $1;', [token]);

    // auto-login user
    req.session.user_id = user.id;

    res.status(200).json({ success: true, message: 'Email verified', user });
  } catch (error) {
    console.error('Error verifying pending user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * validate-token
 */
router.get('/validate-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const valid = await user_queries.validateToken(token);
    res.status(200).send(valid ? 'valid' : 'invalid');
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * resend-verification (for existing users flow)
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await user_queries.getUserByEmail(email);

    if (!user) {
      res.status(400).json({ success: false, message: 'User not found.' });
      return;
    }

    const token = crypto.randomBytes(64).toString('hex');
    await user_queries.insertOrUpdateToken(user.id, token);

    const sent = await sendVerificationEmail(email, token);

    res.status(sent ? 200 : 500).json({
      success: sent,
      message: sent ? 'Verification email sent successfully.' : 'Failed to send verification email.',
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * Worker profiles management endpoints
 */

/**
 * GET /api/worker-profiles/:userId
 * Returns all worker profiles for a user
 */
router.get('/worker-profiles/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) return res.status(400).json({ message: 'Invalid userId' });

  try {
    const { rows } = await db.query('SELECT * FROM workers WHERE user_id = $1 ORDER BY is_primary DESC, created_at ASC;', [userId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching worker profiles:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /api/worker-profiles
 * Body: { userId, firstName, lastName, profileName, makePrimary }
 * Creates new profile. If makePrimary=true, toggles primary for user.
 */
router.post('/worker-profiles', async (req, res) => {
  const { userId, firstName, lastName, profileName, makePrimary } = req.body;

  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    // If user does not exist, return error
    const user = await user_queries.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If makePrimary true, clear previous primary
    if (makePrimary) {
      await db.query('UPDATE workers SET is_primary = false WHERE user_id = $1;', [userId]);
    }

    const workerRow = await createWorkerProfile(userId, firstName, lastName, profileName || 'Default', !!makePrimary);
    res.status(201).json({ success: true, profile: workerRow });
  } catch (err) {
    console.error('Error creating worker profile:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /api/worker-profiles/:userId/primary/:workerId
 * Set the specified worker profile as primary for the user.
 */
router.post('/worker-profiles/:userId/primary/:workerId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const workerId = parseInt(req.params.workerId, 10);

  if (Number.isNaN(userId) || Number.isNaN(workerId)) return res.status(400).json({ message: 'Invalid ids' });

  try {
    const updated = await setPrimaryProfile(userId, workerId);
    if (!updated) return res.status(404).json({ message: 'Worker profile not found for user' });
    res.status(200).json({ success: true, profile: updated });
  } catch (err) {
    console.error('Error setting primary profile:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * DELETE /api/worker-profiles/:userId/:workerId
 * Delete a specific worker profile. If deleting primary, picks another profile to be primary (first available).
 */
router.delete('/worker-profiles/:userId/:workerId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const workerId = parseInt(req.params.workerId, 10);

  if (Number.isNaN(userId) || Number.isNaN(workerId)) return res.status(400).json({ message: 'Invalid ids' });

  try {
    // Delete the worker profile
    const { rowCount } = await db.query('DELETE FROM workers WHERE id = $1 AND user_id = $2;', [workerId, userId]);
    if (rowCount === 0) return res.status(404).json({ message: 'Worker profile not found' });

    // Ensure there is a primary profile for user; if none, pick the earliest one
    const { rows: primRows } = await db.query('SELECT id FROM workers WHERE user_id = $1 AND is_primary = true LIMIT 1;', [userId]);
    if (primRows.length === 0) {
      const { rows } = await db.query('SELECT id FROM workers WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1;', [userId]);
      if (rows.length > 0) {
        await db.query('UPDATE workers SET is_primary = true WHERE id = $1;', [rows[0].id]);
      }
    }

    res.status(200).json({ success: true, message: 'Profile deleted' });
  } catch (err) {
    console.error('Error deleting worker profile:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * login
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  user_queries
    .checkLoginCredentials(email, password)
    .then((foundUser) => {
      if (!foundUser) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }
      req.session.user_id = foundUser.id;
      res.status(200).json(foundUser);
    })
    .catch((err) => {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

/**
 * me
 */
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.user_id) {
      res.status(401).json({ error: 'Not logged in' });
      return;
    }

    const user = await user_queries.getUserById(req.session.user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error in /api/me:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * initiate-password-reset
 */
router.post('/initiate-password-reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await user_queries.getUserByEmail(email);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const existingToken = await user_queries.getUserResetToken(user.id);
    if (existingToken) {
      await user_queries.deleteUserResetToken(user.id);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await user_queries.saveUserResetToken(user.id, resetToken);

    const sent = await sendPasswordResetEmail(email, resetToken);

    if (!sent) {
      res.status(500).json({ success: false, message: 'Failed to send reset email' });
      return;
    }

    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error initiating password reset:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * reset-password
 */
router.post('/reset-password', async (req, res) => {
  const { newPassword, confirmPassword, uniqueIdentifier } = req.body;

  try {
    const user = await user_queries.getUserIdAndToken(uniqueIdentifier);

    if (!user) {
      res.status(404).json({ success: false, message: 'Invalid reset link' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await user_queries.updateUserPassword(user.userId, hashedPassword);
    await user_queries.deleteUserResetToken(user.userId);

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Error destroying session:', err);
    res.status(200).send();
  });
});

/**
 * Conversation + messaging + search routes (unchanged)
 */
router.get('/conversation-partners/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const partners = await user_queries.getConversationPartners(userId);
    res.status(200).json({ success: true, partners });
  } catch (error) {
    console.error('Error fetching conversation partners:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/message-history', async (req, res) => {
  const { senderId, receiverId } = req.query;

  if (!senderId || !receiverId) {
    return res.status(400).json({ success: false, message: 'Missing senderId or receiverId' });
  }

  try {
    const messages = await user_queries.getMessageHistory(senderId, receiverId);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/send-message', async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ success: false, message: 'Missing senderId, receiverId, or content' });
  }

  try {
    const message = await user_queries.sendMessage(senderId, receiverId, content);
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/latest-messages/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await user_queries.getLatestMessages(userId);

    if (messages.length === 0) {
      return res.status(404).json({ success: false, message: 'No messages found' });
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching latest messages:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/search-users', async (req, res) => {
  const { query } = req.query;

  try {
    const values = [];
    let whereClause = '';

    if (query) {
      values.push(`%${query}%`);
      whereClause = `
        WHERE
          (w.first_name ILIKE $1 OR
           w.last_name ILIKE $1 OR
           b.business_name ILIKE $1)
      `;
    }

    const searchQuery = `
      SELECT
        u.id,
        u.isbusiness,
        u.userimage AS "userImage",
        u.user_phone_number AS phone_number,
        u.email,
        l.city,
        l.province,
        w.first_name,
        w.last_name,
        COALESCE(array_agg(DISTINCT s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL), '{}') AS skills,
        COALESCE(array_agg(DISTINCT t.trait_name) FILTER (WHERE t.trait_name IS NOT NULL), '{}') AS traits,
        COALESCE(array_agg(DISTINCT e.experience_name) FILTER (WHERE e.experience_name IS NOT NULL), '{}') AS experiences,
        b.business_name,
        b.business_description
      FROM users u
      JOIN locations l ON u.user_address = l.location_id
      LEFT JOIN workers w ON u.id = w.user_id
      LEFT JOIN businesses b ON u.id = b.user_id
      LEFT JOIN workers_skills ws ON w.id = ws.workers_id
      LEFT JOIN skills s ON ws.skill_id = s.skill_id
      LEFT JOIN workers_traits wt ON w.id = wt.workers_id
      LEFT JOIN traits t ON wt.trait_id = t.trait_id
      LEFT JOIN workers_experiences we ON w.id = we.workers_id
      LEFT JOIN experiences e ON we.experience_id = e.experience_id
      ${whereClause}
      GROUP BY u.id, l.city, l.province, w.id, b.id;
    `;

    const { rows } = await db.query(searchQuery, values);
    res.json(rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Server error');
  }
});

router.get('/user-details/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userDetails = await user_queries.getUserDetails(userId);

    if (userDetails.type === 'unknown') {
      return res.status(404).json({ success: false, message: userDetails.message });
    }

    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;