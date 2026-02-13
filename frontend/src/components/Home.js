import React, { useContext, useEffect, useState } from 'react';
import { EventContext } from '../context/EventContext';
import Event from './Event';

function Home() {
  const { events, getAllEvents } = useContext(EventContext);
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
          <div className="spinner-border text-light spinner-home" role="status" aria-hidden="true">
          </div>
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
                <p className="empty-state-sub">Be the first to create one!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
