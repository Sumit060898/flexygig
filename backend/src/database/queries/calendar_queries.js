const db = require('../connection.js');

// Fetch schedule by user ID
const getScheduleByUserId = (user_id) => {
  const query = `
    SELECT 
      id, 
      to_char(startDate, 'YYYY-MM-DD') AS startDate, 
      to_char(endDate, 'YYYY-MM-DD') AS endDate, 
      startTime, 
      endTime, 
      title
    FROM schedule 
    WHERE user_id = $1;
  `;

  return db
    .query(query, [user_id])
    .then((result) => result.rows)
    .catch((err) => {
      console.error('Error fetching schedule:', err);
      throw err;
    });
};

// Insert a new schedule
const setSchedule = (user_id, startDate, endDate, startTime, endTime, title) => {
  const query = `
    INSERT INTO schedule (user_id, startDate, endDate, startTime, endTime, title) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING id, startDate, endDate, startTime, endTime, title;
  `;
  const values = [user_id, startDate, endDate, startTime, endTime, title];

  return db
    .query(query, values)
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error('Error inserting schedule:', err);
      throw err;
    });
};

// Delete an event by its ID
const deleteEvent = (eventId) => {
  const query = 'DELETE FROM schedule WHERE id = $1';

  return db
    .query(query, [eventId])
    .then(() => {
      console.log('Event deleted successfully');
    })
    .catch((err) => {
      console.error('Error deleting event:', err);
      throw err;
    });
};

module.exports = {
  getScheduleByUserId,
  setSchedule,
  deleteEvent,
};