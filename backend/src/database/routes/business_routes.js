const express = require('express');
const router = express.Router();
const db = require('../connection'); // make sure the path is correct

// GET business by user_id
router.get('/business/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const result = await db.query(
      'SELECT business_name FROM businesses WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching business:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
