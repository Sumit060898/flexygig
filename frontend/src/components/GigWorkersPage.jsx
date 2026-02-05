// frontend/src/components/GigWorkersPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/GigWorkersPage.css';
import { isWithinInterval, addDays } from 'date-fns';

// <-- new: worker context to let logged-in worker switch active profile here
import { useWorker } from './WorkerContext';
import { useUser } from './UserContext';

const GigWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [availability, setAvailability] = useState([]);

  // WorkerContext (profiles + active)
  const {
    profiles = [],
    activeProfile = null,
    activeWorkerProfileId,
    setActiveWorkerProfileId,
    loadingProfiles,
  } = useWorker();

  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerData = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/gig-workers`, { withCredentials: true });
        setWorkers(workerData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        // Map over workers and fetch each one's calendar
        const responses = await Promise.all(
          workers.map(worker =>
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/my-calendar/${worker.user_id}`, { withCredentials: true })
              .then(resp => resp)
              .catch(err => {
                // If one worker calendar fails, log and return an empty array for that worker
                console.error(`Error fetching calendar for user ${worker.user_id}:`, err);
                return { data: [] };
              })
          )
        );

        const availabilityData = responses.map((response, index) => ({
          userId: workers[index].user_id,
          dates: (response.data || []).map(entry => ({
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
            // include the end date
            end: addDays(new Date(dateRange.end), 1)
          })
        );
        return isAvailable ? 'highlight-day' : '';
      }
    }
    return '';
  };

  return (
    <div className="workers-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1>Gig Workers</h1>

        {/* If logged-in user is a worker (not a business), show their active profile and allow quick switching */}
        {user && !user.isbusiness && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="active-profile-select" style={{ fontSize: '0.9rem' }}>Active profile:</label>
            <select
              id="active-profile-select"
              value={activeWorkerProfileId || ''}
              onChange={(e) => {
                const val = e.target.value;
                setActiveWorkerProfileId(val === '' ? null : Number(val));
              }}
              disabled={loadingProfiles}
            >
              {loadingProfiles && <option value="">Loading...</option>}
              {!loadingProfiles && profiles.length === 0 && <option value="">No profiles</option>}
              {!loadingProfiles && profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.profile_name}
                </option>
              ))}
            </select>

            {/* show the selected profile name */}
            <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              {activeProfile ? `(${activeProfile.profile_name})` : ''}
            </div>
          </div>
        )}
      </div>

      <ul className="workers-list">
        {workers.map(worker => {
          // defensive defaults
          const firstname = worker.firstname || worker.first_name || '';
          const lastname = worker.lastname || worker.last_name || '';
          const biography = worker.biography || '';
          const skillsArr = Array.isArray(worker.skills) ? worker.skills : (worker.skills ? [worker.skills] : []);
          const desiredPay = worker.desired_pay ?? '';
          const city = worker.worker_city || worker.city || '';
          const province = worker.worker_province || worker.province || '';

          return (
            <li key={worker.user_id} className="workers-item">
              <div className="workers-info">
                <h2>{firstname} {lastname}</h2>

                <h3>About:</h3>
                <p>{biography || 'No biography provided.'}</p>

                <h3>Skills:</h3>
                <p>{skillsArr.length > 0 ? skillsArr.join(', ') : 'No skills listed.'}</p>

                <h3>Hourly Rate:</h3>
                <p>{desiredPay !== '' ? `$${desiredPay}` : 'Not specified'}</p>

                <h3>Location:</h3>
                <p>{city}{city && province ? ', ' : ''}{province}</p>
              </div>

              <div className="availability-container">
                <h3>{firstname}'s Availability</h3>
                <Calendar
                  tileClassName={tileClassName(worker.user_id)}
                />
              </div>

              <button className="contact-button">Contact</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GigWorkersPage;