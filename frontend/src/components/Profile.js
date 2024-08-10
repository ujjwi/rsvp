import React, { useContext, useEffect, useState } from "react";
import Event from "./Event";
import { EventContext } from "../context/EventContext";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';

function Profile() {
  const { id } = useParams();
  const host = "https://rsvp-backend-iwyf.onrender.com";
  const { events, getAllEvents } = useContext(EventContext);

  const [user, setUser] = useState({});
  const [eventsAttending, setEventsAttending] = useState([]);
  const [eventsHosting, setEventsHosting] = useState([]);
  const [activeTab, setActiveTab] = useState("attending"); // State for active tab
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState(null);

  const isCurrentUser = localStorage.getItem("userId") === id;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${host}/api/auth/getuser/${id}`);
        const data = await response.json();
        setUser(data);
        setPassword(data.password);

        // Fetch events attending and hosting
        const attendingResponse = await fetch(
          `${host}/api/event/eventsvisiting/${id}`
        );
        const attendingData = await attendingResponse.json();
        setEventsAttending(attendingData);

        const hostingResponse = await fetch(
          `${host}/api/event/eventshosting/${id}`
        );
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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (enteredPassword) => {
    try {
      if (!enteredPassword || password !== enteredPassword) {
        console.log(enteredPassword);
        toast.error("Wrong Password!!");
        return;
      }
  
      const response = await fetch(`${host}/api/auth/deleteuser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')
        },
        body: JSON.stringify({ password: enteredPassword }),
      });
  
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/"; // Redirect to home or login after account deletion
        toast.success("Account deleted successfully");
      } else {
        console.error("Error deleting account:", data.error);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };
  
  

  const handleEditSubmit = async (updatedUser) => {
    try {
      const formData = new FormData();
  
      formData.append("name", updatedUser.name);
      formData.append("email", updatedUser.email);
  
      if (updatedUser.displayPicture instanceof File) {
        formData.append("displayPicture", updatedUser.displayPicture);
      }
  
      const response = await fetch(`${host}/api/auth/updateuser`, {
        method: "PUT",
        headers: {
          "auth-token": localStorage.getItem('token')
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (data.success) {
        setUser(data.user);
        setShowEditModal(false);
      } else {
        console.error("Error updating profile:", data.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };


  return (
    <div style={{ backgroundColor: "black", paddingTop: "100px" }}>
      <div className="container">
        <div className="profile-card-container">
          <div className="profile-card">
            {user.displayPicture && (
              <img
                src={user.displayPicture}
                alt="Profile"
                className="profile-image"
              />
            )}
            <div className="profile-header">
              <h2>{user.name}</h2>
              {isCurrentUser && (
                <div className="dropdown">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    className="bi bi-three-dots-vertical"
                    viewBox="0 0 16 16"
                    onClick={toggleMenu}
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                  </svg>
                  {showMenu && (
                    <div className="dropdown-menu show">
                      <button className="dropdown-item" onClick={handleEdit}>
                        <img
                          className="dropdown-icon"
                          src="/images/edit.png"
                          alt="edit-profile"
                        />{" "}
                        Edit profile
                      </button>
                      <button className="dropdown-item" onClick={handleDelete}>
                        <img
                          className="dropdown-icon"
                          src="/images/delete.png"
                          alt="delete-profile"
                        />{" "}
                        Delete account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="tabs">
          <button
            onClick={() => setActiveTab("attending")}
            style={{ color: "white" }}
            className={activeTab === "attending" ? "active" : ""}
          >
            Events Attending
          </button>
          <button
            onClick={() => setActiveTab("hosting")}
            style={{ color: "white" }}
            className={activeTab === "hosting" ? "active" : ""}
          >
            Events Hosting
          </button>
        </div>
        <div className="events-container">
          {loading ? (
            <div
              className="spinner-border text-light spinner-home"
              role="status"
            ></div>
          ) : (
            <>
              {activeTab === "attending" ? (
                eventsAttending.length > 0 ? (
                  eventsAttending.map((event) => (
                    <div className="col-md-4 my-5" key={event._id}>
                      <Event key={event._id} event={event} />
                    </div>
                  ))
                ) : (
                  <p style={{ color: "white" }}>No events attending</p>
                )
              ) : eventsHosting.length > 0 ? (
                eventsHosting.map((event) => (
                  <div className="col-md-4 my-5" key={event._id}>
                    <Event key={event._id} event={event} />
                  </div>
                ))
              ) : (
                <p style={{ color: "white" }}>No events hosting</p>
              )}
            </>
          )}
        </div>
      </div>
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

const EditProfileModal = ({ user, onClose, onSubmit }) => {
  const [editedUser, setEditedUser] = useState(user);

  const handleChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(editedUser);
  };

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Profile</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={editedUser.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={editedUser.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  className="form-control"
                  name="displayPicture"
                  onChange={(e) => setEditedUser({ ...editedUser, displayPicture: e.target.files[0] })}
                />
              </div>
              <button type="submit" className="btn btn-primary mt-3">
                Save changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
  const [enteredPassword, setEnteredPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(enteredPassword);
  };

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Deletion</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>Type your password below to delete your account</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Profile;
