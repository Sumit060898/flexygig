// src/database/routes/user_routes.js
const express = require('express');
const db = require('../connection.js');
const router = express.Router();
const user_queries = require('../queries/user_queries.js');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const workers_queries = require('../queries/workers_queries.js');
require('dotenv').config();

/**
 * Helper: send a generic email. Returns { success: boolean, info?:object, error?:Error }
 */
async function sendEmail({ to, subject, html, from }) {
  // require minimal SMTP env vars
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true"; // true for 465
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const errMsg = `Missing SMTP config. SMTP_HOST=${!!host}, SMTP_USER=${!!user}, SMTP_PASS=${!!pass}`;
    console.error(errMsg);
    return { success: false, error: new Error(errMsg) };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    // optional: allow self-signed certs in some hosted envs (only if needed)
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false"
    }
  });

  const mailOptions = {
    from: from || process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error };
  }
}

/**
 * sendVerificationEmail: wrapper that builds verification link
 * returns boolean success
 */
async function sendVerificationEmail(email, token) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || process.env.REACT_APP_FRONTEND_URL || '';
    const verifyLink = frontendUrl ? `${frontendUrl.replace(/\/$/, '')}/verify-email/${token}` : `verify-email/${token}`;

    const html = `
      <p>Thanks for signing up!</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
      <p>If the link doesn't work, copy-paste the URL into your browser.</p>
    `;

    const res = await sendEmail({
      to: email,
      subject: "Verify your FlexyGig account",
      html
    });

    return res.success;
  } catch (err) {
    console.error("sendVerificationEmail unexpected error:", err);
    return false;
  }
}

/**
 * Registration route (improved handling)
 */
router.post("/register", async (req, res) => {
  const { email, password, accountType, phone_number, photo, firstName, lastName, businessName, businessDescription } = req.body;

  console.log("Incoming registration data:", { email, accountType, phone_number, firstName, lastName, businessName });

  if (!email || !password || !accountType) {
    res.status(400).send("Invalid credentials");
    return;
  }

  try {
    // check if email is not already in db
    const foundUser = await user_queries.getUserByEmail(email);

    if (foundUser) {
      res.status(400).send("Email already exists");
      return;
    }

    // turn accountType to boolean isBusiness
    let isBusiness = "";
    if (accountType === "Worker") {
      isBusiness = "false";
    } else if (accountType === "Employer") {
      isBusiness = "true";
    }

    // add user into database
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await user_queries.addUser(email, hashedPassword, isBusiness, phone_number, photo);

    console.log("User added:", user);

    // add name to the appropriate table based on accountType
    if (accountType === "Worker") {
      await user_queries.addWorker(user.id, firstName, lastName);
    } else if (accountType === "Employer") {
      await user_queries.addBusiness(user.id, businessName, businessDescription);
    }

    // generate a verification token and save it
    const verificationToken = crypto.randomBytes(64).toString('hex');
    await user_queries.saveVerificationToken(user.id, verificationToken);

    const updatedUser = await user_queries.getUserById(user.id);

    // respond to the client first so they don't wait for email
    res.status(200).json({
      message: "User registered successfully. Please check your email for verification.",
      user: updatedUser
    });

    // fire-and-forget email send (log result). do NOT throw here if email fails.
    sendVerificationEmail(email, verificationToken)
      .then(success => {
        if (!success) {
          console.error(`Failed to send verification email to ${email}`);
        } else {
          console.log(`Verification email queued/sent to ${email}`);
        }
      })
      .catch(err => {
        console.error("Unexpected error while sending verification email:", err);
      });

  } catch (error) {
    console.error('Error during user registration:', error);
    // If we haven't already responded:
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
});

/**
 * Verification link handler
 */
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const result = await db.query(`SELECT * FROM pending_users WHERE token = $1;`, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid or expired token" });
    }

    const pending = result.rows[0];

    const existingUser = await user_queries.getUserByEmail(pending.email);
    if (existingUser) {
      await db.query(`DELETE FROM pending_users WHERE token = $1;`, [token]); // Cleanup
      return res.status(400).json({ message: "User already verified" });
    }

    const locationResult = await db.query(`
      INSERT INTO locations (StreetAddress, city, province, postalCode)
      VALUES ($1, $2, $3, $4)
      RETURNING location_id;
    `, [
      pending.street_address,
      pending.city,
      pending.province,
      pending.postal_code
    ]);

    const locationId = locationResult.rows[0].location_id;

    const user = await user_queries.addUser(
      pending.email,
      pending.password,
      pending.account_type === "Employer",
      pending.phone_number,
      pending.photo,
      locationId
    );

    if (pending.account_type === "Worker") {
      const worker = await user_queries.addWorker(user.id, pending.first_name, pending.last_name);

      const skills = typeof pending.skills === "string" ? JSON.parse(pending.skills) : pending.skills;
      for (const skill of skills) {
        await workers_queries.addWorkerSkill(worker.id, skill.skill_id);
      }
      const experiences = typeof pending.experiences === "string" ? JSON.parse(pending.experiences) : pending.experiences;
      for (const experience of experiences) {
        await workers_queries.addWorkerExperience(worker.id, experience.experience_id);
      }
      const traits = typeof pending.traits === "string" ? JSON.parse(pending.traits) : pending.traits;
      for (const trait of traits) {
        await workers_queries.addWorkerTrait(worker.id, trait.trait_id);
      }
    } else {
      await user_queries.addBusiness(user.id, pending.business_name, pending.business_description || "");
    }

    await db.query(`DELETE FROM pending_users WHERE token = $1;`, [token]);

    req.session.user_id = user.id;
    res.status(200).json(user);
  } catch (error) {
    console.error("Error verifying pending user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Validate token (used by frontend to check link)
 */
router.get('/validate-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const valid = await user_queries.validateToken(token);
    res.status(200).send(valid ? "valid" : "invalid");
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Resend verification email for an existing user (not pending)
 */
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const response = await resendVerificationEmail(email);
    res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const resendVerificationEmail = async (email) => {
  try {
    const user = await user_queries.getUserByEmail(email);

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const token = crypto.randomBytes(64).toString('hex');
    const userId = await user_queries.insertOrUpdateToken(user.id, token);

    const sent = await sendVerificationEmail(email, token);
    return { success: sent, message: sent ? 'Verification email sent successfully.' : 'Failed to send verification email.' };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, message: 'Internal Server Error' };
  }
};

/**
 * Create pending user (used by frontend sign-up -> pending -> verify flow)
 */
router.post("/pending-register", async (req, res) => {
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
    traits
  } = req.body;

  if (!email || !password || !accountType) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await user_queries.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const pendingResult = await db.query('SELECT * FROM pending_users WHERE email = $1;', [email]);
    if (pendingResult.rows.length > 0) {
      return res.status(400).json({ message: "A user with this email is already pending verification." });
    }

    const token = crypto.randomBytes(64).toString("hex");
    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.query(`
      INSERT INTO pending_users
        (email, password, account_type, first_name, last_name, business_name, business_description, phone_number, photo, token, street_address, city, province, postal_code, skills, experiences, traits)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    `, [
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
      JSON.stringify(traits)
    ]);

    // respond first, then send email asynchronously
    res.status(200).json({ message: "Please check your email to complete registration." });

    sendVerificationEmail(email, token)
      .then(success => {
        if (!success) {
          console.error(`Failed to send pending verification email to ${email}`);
        } else {
          console.log(`Pending verification email sent to ${email}`);
        }
      })
      .catch(err => console.error("Unexpected error sending pending verification email:", err));

  } catch (error) {
    console.error("Error creating pending user:", error);
    if (!res.headersSent) res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Login
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  user_queries.checkLoginCredentials(email, password)
    .then((foundUser) => {
      if (!foundUser) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }
      req.session.user_id = foundUser.id;
      res.status(200).json(foundUser);
    })
    .catch((err) => {
      console.error("Error during login:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

/**
 * Get current logged-in user
 */
router.get("/me", async (req, res) => {
  try {
    if (!req.session || !req.session.user_id) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }

    const user = await user_queries.getUserById(req.session.user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /api/me:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Password reset: initiate
 * This now uses sendEmail helper and returns success/failure.
 */
router.post("/initiate-password-reset", async (req, res) => {
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

    const resetToken = crypto.randomBytes(32).toString("hex");
    await user_queries.saveUserResetToken(user.id, resetToken);

    const frontendUrl = process.env.FRONTEND_URL || '';
    const resetLink = frontendUrl ? `${frontendUrl.replace(/\/$/, '')}/password-reset/${resetToken}` : `password-reset/${resetToken}`;

    const html = `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    const emailRes = await sendEmail({
      to: email,
      subject: 'FlexyGig - Password Reset',
      html
    });

    if (!emailRes.success) {
      console.error("Failed to send password reset email:", emailRes.error);
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
 * Password reset: complete
 */
router.post("/reset-password", async (req, res) => {
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
 * Logout
 */
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.status(200).send();
  });
});

/**
 * Messaging / conversation / search routes (kept as-is)
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

router.get("/search-users", async (req, res) => {
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
    console.error("Search error:", err);
    res.status(500).send("Server error");
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