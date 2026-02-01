import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/GigWorkersPage.css';
import { isWithinInterval, addDays } from 'date-fns';

const GigWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerData = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/gig-workers`, { withCredentials: true });
        setWorkers(workerData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const responses = await Promise.all(
          workers.map(worker =>
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/my-calendar/${worker.user_id}`, { withCredentials: true })
          )
        );
        const availabilityData = responses.map((response, index) => ({
          userId: workers[index].user_id,
          dates: response.data.map(entry => ({
            start: new Date(entry.startdate),
            end: new Date(entry.enddate),
          })),
        }));
        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    if (workers.length > 0) {
      fetchAvailability();
    }
  }, [workers]);

  const tileClassName = (workerId) => ({ date, view }) => {
    if (view === 'month' && workerId) {
      const workerAvailability = availability.find(avail => avail.userId === workerId);
      if (workerAvailability) {
        const isAvailable = workerAvailability.dates.some(dateRange =>
          isWithinInterval(date, {
            start: dateRange.start,
            // Add one day to the end date to include it in the interval
            end: addDays(new Date(dateRange.end), 1)
          })
        );
        return isAvailable ? 'highlight-day' : '';
      }
    }
  };

  return (
    <div className="workers-container">
      <h1>Gig Workers</h1>
      <ul className="workers-list">
        {workers.map(worker => (
          <li key={worker.user_id} className="workers-item">
            <div className="workers-info">
              <h2>{worker.firstname} {worker.lastname}</h2>
              <h3>About:</h3>
              <p>{worker.biography}</p>
              <h3>Skills:</h3>
              <p> {worker.skills.join(', ')}</p>
              <h3>Hourly Rate:</h3>
              <p> ${worker.desired_pay}</p>
              <h3>Location:</h3>
              <p> {worker.worker_city}, {worker.worker_province}</p>
            </div>
            <div className="availability-container">
              <h3>{worker.firstname}'s Availability</h3>
              <Calendar
                tileClassName={tileClassName(worker.user_id)}
              />
            </div>
            <button className="contact-button">Contact</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GigWorkersPage;