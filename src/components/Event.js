import React, { useContext, useEffect, useState, useCallback } from 'react';
import { EventContext } from '../context/EventContext';
// import { useParams } from 'react-router-dom';

const Event = (props) => {
    // const { id } = useParams();
    const id = props.id;

    const host = "http://localhost:5000";

    const [creator, setCreator] = useState(null);

    const { event, getEventById, attendEvent, unattendEvent, attendingEvents } = useContext(EventContext);
    const [isAttending, setIsAttending] = useState(false);

    useEffect(() => {
        getEventById(id);
    }, [id, getEventById]);

    useEffect(() => {
        if (event) {
            setIsAttending(attendingEvents.some(e => e._id === event._id));
            fetchCreator(event.createdBy);
        }
    }, [event, attendingEvents]);

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
                <button onClick={isAttending ? handleUnattend : handleAttend}>
                    {isAttending ? 'Not attending' : 'Attending'}
                </button>
            </div>
        </div>
    );
};

export default Event;
