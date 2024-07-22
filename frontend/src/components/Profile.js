import React, { useContext, useEffect, useState } from 'react';
import Event from './Event';
import { EventContext } from '../context/EventContext';
import { useParams } from 'react-router-dom';

function Profile() {
  const { id } = useParams();
  const host = "https://rsvp-backend-iwyf.onrender.com";
  const { events, getAllEvents } = useContext(EventContext);

  const [user, setUser] = useState({});
  const [eventsAttending, setEventsAttending] = useState([]);
  const [eventsHosting, setEventsHosting] = useState([]);
  const [activeTab, setActiveTab] = useState('attending'); // State for active tab
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${host}/api/auth/getuser/${id}`);
        const data = await response.json();
        setUser(data);

        // Fetch events attending and hosting
        const attendingResponse = await fetch(`${host}/api/event/eventsvisiting/${id}`);
        const attendingData = await attendingResponse.json();
        setEventsAttending(attendingData);

        const hostingResponse = await fetch(`${host}/api/event/eventshosting/${id}`);
        const hostingData = await hostingResponse.json();
        setEventsHosting(hostingData);

        // Fetch all events (similar to Home)
        await getAllEvents();
        setLoading(false);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div style={{ backgroundColor: 'black', paddingTop: '100px' }}>
      <div className="container">
        <div className="profile-card">
          {user.displayPicture && (
            <img
              src={user.displayPicture}
              alt="Profile"
              className="profile-image"
            />
          )}
          <h2>{user.name}</h2>
        </div>
        <div className="tabs">
          <button onClick={() => setActiveTab('attending')} style={{ color: 'white' }} className={activeTab === 'attending' ? 'active' : ''}>Events Attending</button>
          <button onClick={() => setActiveTab('hosting')} style={{ color: 'white' }} className={activeTab === 'hosting' ? 'active' : ''}>Events Hosting</button>
        </div>
        <div className="events-container">
          {loading ? (
            <div className="spinner-border text-light spinner-home" role="status"></div>
          ) : (
            <>
              {activeTab === 'attending' ? (
                eventsAttending.length > 0 ? eventsAttending.map(event => (
                  <div className="col-md-4 my-5" key={event._id}>
                    <Event key={event._id} event={event} />
                  </div>
                )) : <p style={{ color: 'white' }}>No events attending</p>
              ) : (
                eventsHosting.length > 0 ? eventsHosting.map(event => (
                  <div className="col-md-4 my-5" key={event._id}>
                    <Event key={event._id} event={event} />
                  </div>
                )) : <p style={{ color: 'white' }}>No events hosting</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
