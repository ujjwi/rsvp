import React, { useState, useEffect } from "react";

function Profile(props) {
  const host = "https://rsvp-backend-iwyf.onrender.com";

  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${host}/api/auth/getuser/${props.id}`);
        const data = await response.json();
        console.log(data);
        setUser(data);
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
    </div>
  );
}

export default Profile;
