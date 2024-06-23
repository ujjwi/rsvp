import React, { useContext, useEffect } from 'react';
import { EventContext } from '../context/EventContext';
import Event from './Event';

function Home() {
  const { events, getAllEvents } = useContext(EventContext);

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <div>
      <h1>Homepage</h1>
      {events && events.map(event => (
        <Event key={event._id} event={event} />
      ))}
    </div>
  );
}

export default Home;