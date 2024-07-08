import React, { createContext, useState } from 'react';

export const EventContext = createContext();

const EventState = ({ children }) => {
    const host = "https://rsvp-backend-iwyf.onrender.com";

    const [events, setEvents] = useState([]);
    const [attendingEvents, setAttendingEvents] = useState([]);
    const [hostingEvents, setHostingEvents] = useState([]);
    const [event, setEvent] = useState(null);

    // Get all events
    const getAllEvents = async () => {
        try {
            const response = await fetch(`${host}/api/event/getallevents`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const resp = await response.json();
            setEvents(resp);
        } catch (error) {
            console.error("Error fetching all events:", error);
        }
    }

    // Get events user is attending
    const getEventsAttending = async () => {
        try {
            const response = await fetch(`${host}/api/event/eventsvisiting`, {
                method: "GET",
                headers: {
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            setAttendingEvents(resp);
        } catch (error) {
            console.error("Error fetching events attending:", error);
        }
    }

    // Get events user is hosting
    const getEventsHosting = async () => {
        try {
            const response = await fetch(`${host}/api/event/eventshosting`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            setHostingEvents(resp);
        } catch (error) {
            console.error("Error fetching events hosting:", error);
        }
    }

    // Get event by ID
    const getEventById = async (id) => {
        try {
            const response = await fetch(`${host}/api/event/getallevents/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const resp = await response.json();
            setEvent(resp);
        } catch (error) {
            console.error("Error fetching event by ID:", error);
        }
    }

    // Add new event
    const addEvent = async (event) => {
        try {
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
        } catch (error) {
            console.error("Error adding event:", error);
        }
    }

    // Update event
    const updateEvent = async (id, updatedEvent) => {
        try {
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
        } catch (error) {
            console.error("Error updating event:", error);
        }
    }

    // Delete event
    const deleteEvent = async (id) => {
        try {
            await fetch(`${host}/api/event/deleteevent/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            setEvents(events.filter(event => event._id !== id));
            setHostingEvents(hostingEvents.filter(event => event._id !== id));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    }

    // Attend event
    const attendEvent = async (id) => {
        try {
            const response = await fetch(`${host}/api/event/attendevent/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            setAttendingEvents([...attendingEvents, resp.event]);
        } catch (error) {
            console.error("Error attending event:", error);
        }
    }

    // Unattend event
    const unattendEvent = async (id) => {
        try {
            const response = await fetch(`${host}/api/event/unattendevent/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            setAttendingEvents(attendingEvents.filter(event => event._id !== id));
        } catch (error) {
            console.error("Error unattending event:", error);
        }
    }

    return (
        <EventContext.Provider value={{
            events, attendingEvents, hostingEvents, event,
            getAllEvents, getEventsAttending, getEventsHosting, getEventById,
            addEvent, updateEvent, deleteEvent, attendEvent, unattendEvent
        }}>
            {children}
        </EventContext.Provider>
    )
}

export default EventState;
