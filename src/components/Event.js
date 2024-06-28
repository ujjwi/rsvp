import React, { useContext, useEffect, useState, useCallback } from 'react';
import { EventContext } from '../context/EventContext';

const Event = ({ event }) => {
    const host = "http://localhost:5000";
    const [creator, setCreator] = useState(null);
    const { getAllEvents, attendEvent, unattendEvent, attendingEvents, getEventsAttending, updateEvent, deleteEvent } = useContext(EventContext);
    const [isAttending, setIsAttending] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleEdit = () => {
        setShowMenu(false);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        setShowMenu(false);
        setShowDeleteModal(true); // Show the delete confirmation modal
    };

    const confirmDelete = async () => {
        await deleteEvent(event._id);
        setShowDeleteModal(false);
    };

    const handleEditSubmit = async (updatedEvent) => {
        await updateEvent(event._id, updatedEvent);
        getAllEvents();
        setShowEditModal(false);
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
        await attendEvent(event._id);
        getEventsAttending();
    };

    const handleUnattend = async () => {
        await unattendEvent(event._id);
        getEventsAttending();
    };

    if (!event || !creator) return <div>Loading...</div>;

    const dpscr = `${host}/${creator.displayPicture.replace(/\\/g, '/')}`;

    const isHost = localStorage.getItem('userId') && localStorage.getItem('userId') === event.createdBy;

    return (
        <div className="event-container gradient-background">
            <div className="event-header">
                <div className="event-uploader-container">
                    <img src={dpscr} alt="Display Picture" className="event-display-picture" />
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
                                <button className="dropdown-item" onClick={handleEdit}>Edit</button>
                                <button className="dropdown-item" onClick={handleDelete}>Remove</button>
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
                <button type="button" className="btn btn-dark" onClick={isAttending ? handleUnattend : handleAttend}>
                    {isAttending ? 'Unattend' : 'Attend'}
                </button>
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


export default Event;
