import React, { useState, useEffect } from "react";
import Event from './Event'; // Import the Event component

function Profile(props) {
  const host = "https://rsvp-backend-iwyf.onrender.com";

  const [user, setUser] = useState({});
  const [eventsAttending, setEventsAttending] = useState([]);
  const [eventsHosting, setEventsHosting] = useState([]);
  const [activeTab, setActiveTab] = useState('attending'); // State for active tab

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${host}/api/auth/getuser/${props.id}`);
        const data = await response.json();
        setUser(data);

        // Fetch events attending and hosting
        const attendingResponse = await fetch(`${host}/api/event/eventsvisiting/${props.id}`);
        const attendingData = await attendingResponse.json();
        setEventsAttending(attendingData);

        const hostingResponse = await fetch(`${host}/api/event/eventshosting/${props.id}`);
        const hostingData = await hostingResponse.json();
        setEventsHosting(hostingData);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [props.id]);

  return (
    <div className="profile-container">
      <div className="profile-card">
        {user.displayPicture && (
          <img
            src={user.displayPicture}
            alt="Profile"
            className="profile-image"
          />
        )}
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
      <div className="tabs">
        <button onClick={() => setActiveTab('attending')} style={{color:"white"}} className={activeTab === 'attending' ? 'active' : ''}>Events Attending</button>
        <button onClick={() => setActiveTab('hosting')} style={{color:"white"}} className={activeTab === 'hosting' ? 'active' : ''}>Events Hosting</button>
      </div>
      <div className="events-container">
        {activeTab === 'attending' ? (
          eventsAttending.length > 0 ? eventsAttending.map(event => (
            <Event key={event._id} event={event} />
          )) : <p style={{color:"white"}}>No events attending</p>
        ) : (
          eventsHosting.length > 0 ? eventsHosting.map(event => (
            <Event key={event._id} event={event} />
          )) : <p style={{color:"white"}}>No events hosting</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
