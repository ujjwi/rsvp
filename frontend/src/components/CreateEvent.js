import React, { useContext, useState } from 'react';
import { EventContext } from '../context/EventContext';
import { toast } from 'react-toastify';

const CreateEvent = () => {
    const { addEvent } = useContext(EventContext);
    const [event, setEvent] = useState({
        title: '',
        description: '',
        startdatetime: '',
        enddatetime: '',
        location: ''
    });

    const handleChange = (e) => {
        setEvent({
            ...event,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addEvent(event);
            toast.success("Event created successfully!");
        } catch (error) {
            toast.error("Failed to create event. Please try again.");
            console.error("Error creating event:", error);
        }
    };

    return (
        <div className="create-event-container">
            <h2>Create New Event</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="title" 
                        value={event.title} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        className="form-control" 
                        name="description" 
                        value={event.description} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Start Date and Time</label>
                    <input 
                        type="datetime-local" 
                        className="form-control" 
                        name="startdatetime" 
                        value={event.startdatetime} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>End Date and Time</label>
                    <input 
                        type="datetime-local" 
                        className="form-control" 
                        name="enddatetime" 
                        value={event.enddatetime} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="location" 
                        value={event.location} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3 btn-create">Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
