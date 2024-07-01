import React, { useContext, useEffect } from 'react';
import { EventContext } from '../context/EventContext';
import Event from './Event';

function Home() {
  const { events, getAllEvents } = useContext(EventContext);

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <div style={{ backgroundColor: 'black' , marginTop:"50px"}}>
      <div className="container">
        <div className="row">
          {events && events.map(event => (
            <div className="col-md-4 my-5" key={event._id}>
              <Event event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;