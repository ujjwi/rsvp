import React, { useContext, useEffect, useState, useCallback } from 'react';
import { EventContext } from '../context/EventContext';

const Event = ({ event }) => {
    const host = "http://localhost:5000";
    const [creator, setCreator] = useState(null);
    const { attendEvent, unattendEvent, attendingEvents } = useContext(EventContext);
    const [isAttending, setIsAttending] = useState(false);

    const fetchCreator = useCallback(async (creatorID) => {
        try {
            const response = await fetch(`${host}/api/auth/getuser/${creatorID}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const resp = await response.json();
            setCreator(resp);
        } catch (error) {
            console.error("Failed to fetch creator data", error);
        }
    }, [host]);

    useEffect(() => {
        if (event) {
            setIsAttending(attendingEvents.some(e => e._id === event._id));
            fetchCreator(event.createdBy);
        }
    }, [event, attendingEvents, fetchCreator]);

    const handleAttend = () => {
        attendEvent(event._id);
        setIsAttending(true);
    };

    const handleUnattend = () => {
        unattendEvent(event._id);
        setIsAttending(false);
    };

    if (!event || !creator) return <div>Loading...</div>;

    const dpscr = `${host}/${creator.displayPicture.replace(/\\/g, '/')}`;
    // console.log(dpscr);

    return (
        <div className="event-container">
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
