import React, { useContext, useEffect, useState, useCallback } from 'react';
import { EventContext } from '../context/EventContext';

const Event = ({ event }) => {
    const host = "http://localhost:5000";
    const [creator, setCreator] = useState(null);
    const { attendEvent, unattendEvent, attendingEvents, getEventsAttending } = useContext(EventContext);
    const [isAttending, setIsAttending] = useState(false);

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
        if(localStorage.getItem('token'))
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

    return (
        <div className="event-container gradient-background">
            <div className="event-header">
                <img src={dpscr} alt="Display Picture" className="event-display-picture" />
                <div className="event-uploader">{creator.name}</div>
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
        </div>
    );
};

export default Event;