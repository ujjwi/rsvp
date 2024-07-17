import React, { useContext, useEffect, useState, useCallback } from 'react';
import { EventContext } from '../context/EventContext';
import { AuthContext } from '../context/AuthContext';

import { toast } from 'react-toastify';

const Event = ({ event }) => {
    const host = "https://rsvp-backend-iwyf.onrender.com";
    const [creator, setCreator] = useState(null);
    const { getAllEvents, attendEvent, unattendEvent, attendingEvents, getEventsAttending, updateEvent, deleteEvent } = useContext(EventContext);
    const [isAttending, setIsAttending] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAttendees, setShowAttendees] = useState(false);

    const { isLoggedIn } = useContext(AuthContext);
    
    const toggleAttendees = () => {
        setShowAttendees(!showAttendees);
    };
    
    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleEdit = () => {
        setShowMenu(false);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        setShowMenu(false);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteEvent(event._id);
            setShowDeleteModal(false);
            toast.success("Event deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete event. Please try again.");
        }
    };

    const handleEditSubmit = async (updatedEvent) => {
        try {
            await updateEvent(event._id, updatedEvent);
            getAllEvents();
            setShowEditModal(false);
            toast.success("Event updated successfully!");
        } catch (error) {
            toast.error("Failed to update event. Please try again.");
        }
    };

    const fetchCreator = useCallback(async (creatorID) => {
        try {
            const response = await fetch(`${host}/api/auth/getuser/${creatorID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }

            const resp = await response.json();
            setCreator(resp);
        } catch (error) {
            console.error("Failed to fetch creator data", error);
        }
    }, [host]);

    useEffect(() => {
        if (localStorage.getItem('token'))
            getEventsAttending();
    }, []);

    useEffect(() => {
        if (event && event._id) {
            fetchCreator(event.createdBy);
        }
    }, [event, fetchCreator]);

    useEffect(() => {
        if (event && event._id && attendingEvents.length > 0) {
            setIsAttending(attendingEvents.some(e => e._id === event._id));
        }
    }, [event, attendingEvents]);

    const handleAttend = async () => {
        if (isLoggedIn) {
            try {
                await attendEvent(event._id);
                getAllEvents();
                getEventsAttending();
            } catch (error) {
                console.error("Error attending event:", error);
            }
        } else {
            toast.error("You must be logged in to attend an event.");
        }
    };

    const handleUnattend = async () => {
        if (isLoggedIn) {
            try {
                await unattendEvent(event._id);
                getAllEvents();
                getEventsAttending();
            } catch (error) {
                console.error("Error attending event:", error);
            }
        } else {
            toast.error("You must be logged in to unattend an event.");
        }
    };

    if (!event || !creator) return <div>Loading...</div>;

    const isHost = localStorage.getItem('userId') && localStorage.getItem('userId') === event.createdBy;

    return (
        <div className="event-container gradient-background">
            <div className="event-header">
                <div className="event-uploader-container">
                    <img src={creator.displayPicture} alt="Display Picture" className="event-display-picture" />
                    <div className="event-uploader">{creator.name}</div>
                </div>
                {isHost && (
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
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                        {showMenu && (
                            <div className="dropdown-menu show">
                                <button className="dropdown-item" onClick={handleEdit}>
                                    <img className="dropdown-icon" src="images/edit.png" alt="edit-event" /> Edit
                                </button>
                                <button className="dropdown-item" onClick={handleDelete}>
                                    <img className="dropdown-icon" src="images/delete.png" alt="delete-event" /> Remove
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="event-details">
                <div className="event-title">{event.title}</div>
                <div className="event-info">
                    {new Date(event.startdatetime).toLocaleString()} - {new Date(event.enddatetime).toLocaleString()}<br />
                    {event.location}
                </div>
                <div className="event-description">
                    {event.description}
                </div>
            </div>
            <div className="event-footer">
                <div>
                    <button type="button" className="btn btn-link showAttendees" onClick={toggleAttendees}>
                        Show Attendees
                    </button>
                </div>
                <div>
                    <button type="button" className="btn btn-dark mt-2" onClick={isAttending ? handleUnattend : handleAttend}>
                        {isAttending ? 'Unattend' : 'Attend'}
                    </button>
                </div>
            </div>
            {showEditModal && (
                <EditEventModal 
                    event={event} 
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
            {showAttendees && (
                <AttendeesModal 
                    attendeeIds={event.attendees}
                    host={host}
                    onClose={() => setShowAttendees(false)}
                />
            )}
        </div>
    );
};

const EditEventModal = ({ event, onClose, onSubmit }) => {
    const [editedEvent, setEditedEvent] = useState(event);

    const handleChange = (e) => {
        setEditedEvent({
            ...editedEvent,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(editedEvent);
    };

    return (
        <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Event</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="title" 
                                    value={editedEvent.title} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    className="form-control" 
                                    name="description" 
                                    value={editedEvent.description} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date and Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control" 
                                    name="startdatetime" 
                                    value={new Date(editedEvent.startdatetime).toISOString().slice(0, 16)} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date and Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control" 
                                    name="enddatetime" 
                                    value={new Date(editedEvent.enddatetime).toISOString().slice(0, 16)} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="location" 
                                    value={editedEvent.location} 
                                    onChange={handleChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary mt-3">Save changes</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ onClose, onConfirm }) => (
    <div className="modal" style={{ display: 'block' }}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Confirm Deletion</h5>
                    <button type="button" className="close" onClick={onClose}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete this event?</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    </div>
);

const AttendeesModal = ({ attendeeIds, host, onClose }) => {
    const [attendees, setAttendees] = useState([]);

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                const attendeePromises = attendeeIds.map(id =>
                    fetch(`${host}/api/auth/getuser/${id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        },
                    }).then(res => res.json())
                );
                const attendeeData = await Promise.all(attendeePromises);
                setAttendees(attendeeData);
            } catch (error) {
                console.error("Failed to fetch attendee data", error);
                toast.error("Failed to load attendees. Please try again.");
            }
        };

        fetchAttendees();
    }, [attendeeIds, host]);

    return (
        <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Attendees</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {attendees.map(attendee => (
                            <div key={attendee._id} className="attendee-item mb-3">
                                <img src={attendee.displayPicture} alt={attendee.name} className="attendee-avatar" />
                                <span>{attendee.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Event;
