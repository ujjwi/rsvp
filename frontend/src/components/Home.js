import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventContext } from '../context/EventContext';
import { AuthContext } from '../context/AuthContext';
import Event from './Event';
import { EventsGridSkeleton } from './Skeleton';

function Home() {
  const { events, getAllEvents } = useContext(EventContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getAllEvents();
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container">
        {loading ? (
          <>
            <h2 className="page-heading">Upcoming Events</h2>
            <EventsGridSkeleton count={6} />
          </>
        ) : (
          <>
            <h2 className="page-heading">Upcoming Events</h2>
            {events && events.length > 0 ? (
              <div className="row events-row">
                {events.map(event => (
                  <div className="col-md-4 col-lg-4 mb-4" key={event._id}>
                    <Event event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No upcoming events yet.</p>
                <p className="empty-state-sub">
                  {isLoggedIn ? (
                    <>Be the first to create one! <Link to="/createEvent" className="empty-state-link">Create event</Link></>
                  ) : (
                    <>Log in to create an event. <Link to="/login" className="empty-state-link">Login</Link></>
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
