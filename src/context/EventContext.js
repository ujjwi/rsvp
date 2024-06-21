import React, { createContext, useState } from 'react';

export const EventContext = createContext();

const EventState = ({ children }) => {
    const host = "http://localhost:5000";

    const [events, setEvents] = useState([]);
    const [attendingEvents, setAttendingEvents] = useState([]);
    const [hostingEvents, setHostingEvents] = useState([]);
    const [event, setEvent] = useState(null);

    // Get all events
    const getAllEvents = async () => {
        const response = await fetch(`${host}/api/event/getallevents`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const resp = await response.json();
        setEvents(resp);
    }

    // Get events user is attending
    const getEventsAttending = async () => {
        const response = await fetch(`${host}/api/event/eventsvisiting`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });

        const resp = await response.json();
        setAttendingEvents(resp);
    }

    // Get events user is hosting
    const getEventsHosting = async () => {
        const response = await fetch(`${host}/api/event/eventshosting`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });

        const resp = await response.json();
        setHostingEvents(resp);
    }

    // Get event by ID
    const getEventById = async (id) => {
        const response = await fetch(`${host}/api/event/getallevents/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const resp = await response.json();
        setEvent(resp);
    }

    // Add new event
    const addEvent = async (event) => {
        const response = await fetch(`${host}/api/event/addevent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify(event)
        });

        const resp = await response.json();
        setHostingEvents([...hostingEvents, resp]);
        getAllEvents(); // Update the list of all events
    }

    // Update event
    const updateEvent = async (id, updatedEvent) => {
        const response = await fetch(`${host}/api/event/updateevent/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify(updatedEvent)
        });

        const resp = await response.json();
        setEvents(events.map(event => event._id === id ? resp : event));
        setHostingEvents(hostingEvents.map(event => event._id === id ? resp : event));
        setEvent(resp); // Update the current event if it matches the updated one
    }

    // Delete event
    const deleteEvent = async (id) => {
        await fetch(`${host}/api/event/deleteevent/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });

        setEvents(events.filter(event => event._id !== id));
        setHostingEvents(hostingEvents.filter(event => event._id !== id));
    }

    // Attend event
    const attendEvent = async (id) => {
        const response = await fetch(`${host}/api/event/attendevent/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });

        const resp = await response.json();
        setAttendingEvents([...attendingEvents, resp.event]);
    }

    // Unattend event
    const unattendEvent = async (id) => {
        const response = await fetch(`${host}/api/event/unattendevent/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });

        // eslint-disable-next-line
        const resp = await response.json();
        setAttendingEvents(attendingEvents.filter(event => event._id !== id));
    }

    return (
        <EventContext.Provider value={{
            events, attendingEvents, hostingEvents, event,
            getAllEvents, getEventsAttending, getEventsHosting, getEventById,
            addEvent, updateEvent, deleteEvent, attendEvent,unattendEvent
        }}>
            {children}
        </EventContext.Provider>
    )
}

export default EventState;
