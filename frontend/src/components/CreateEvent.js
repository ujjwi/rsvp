import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventContext } from '../context/EventContext';
import { toast } from 'react-toastify';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { addEvent } = useContext(EventContext);
    const [submitting, setSubmitting] = useState(false);
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

        if (event.startdatetime && event.enddatetime && new Date(event.enddatetime) <= new Date(event.startdatetime)) {
            toast.error("End date and time must be after start date and time");
            return;
        }

        setSubmitting(true);
        try {
            await addEvent(event);
            toast.success("Event created successfully!");
            navigate("/");
        } catch (error) {
            // EventContext shows toasts for validation/API errors; only show for network failures
            if (error?.message === "Failed to fetch") {
                toast.error("Failed to create event. Please try again.");
            }
            console.error("Error creating event:", error);
        }
        setSubmitting(false);
    };

    return (
        <div className="page-wrapper">
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
                <button type="submit" className="btn btn-primary mt-3 btn-create" disabled={submitting}>
                {submitting ? "Creating..." : "Create Event"}
            </button>
            </form>
        </div>
        </div>
    );
};

export default CreateEvent;
