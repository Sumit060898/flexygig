const express = require('express');
const router = express.Router();
const calendar_queries = require('../queries/calendar_queries.js');

// Fetch schedule for a specific user
router.get("/my-calendar/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  calendar_queries.getScheduleByUserId(user_id)
    .then((schedule) => {
      res.status(200).json(schedule);
    })
    .catch((error) => {
      console.error('Error fetching schedule:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Add a new schedule
router.post("/my-calendar", (req, res) => {
  const { user_id, startDate, endDate, startTime, endTime, title } = req.body;

  if (!user_id || !startDate || !endDate || !startTime || !endTime || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  calendar_queries.setSchedule(user_id, startDate, endDate, startTime, endTime, title)
    .then((schedule) => {
      res.status(201).json(schedule);
    })
    .catch((error) => {
      console.error('Error adding schedule:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Delete an event by ID
router.delete("/my-calendar/:eventId", (req, res) => {
  const eventId = req.params.eventId;

  calendar_queries.deleteEvent(eventId)
    .then(() => {
      res.status(200).json({ message: 'Event deleted successfully' });
    })
    .catch((error) => {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

module.exports = router;