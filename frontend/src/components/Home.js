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
    <div style={{ backgroundColor: 'black', paddingTop: '100px' }}>
      <div className="container">
        {loading ? (
          <div className="spinner-border text-light spinner-home" role="status">
          </div>
        ) : (
          <>
          <h2 style={{ color: 'white'}}>Upcoming Events</h2>
          <div className="row">
            {events && events.map(event => (
              <div className="col-md-4 my-5" key={event._id}>
                <Event event={event} />
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
