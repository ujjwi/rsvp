import React, { createContext, useState } from 'react';
import API_BASE_URL from '../config';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';

export const EventContext = createContext();

const EventState = ({ children }) => {

    const [events, setEvents] = useState([]);
    const [attendingEvents, setAttendingEvents] = useState([]);
    const [hostingEvents, setHostingEvents] = useState([]);
    const [event, setEvent] = useState(null);

    // Get all events
    const getAllEvents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/event/getallevents`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const resp = await response.json();
            setEvents(response.ok && Array.isArray(resp) ? resp : []);
        } catch (error) {
            console.error("Error fetching all events:", error);
            setEvents([]);
        }
    }

    // Get events user is attending
    const getEventsAttending = async () => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/eventsvisiting`, {
                method: "GET",
                headers: {
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            setAttendingEvents(response.ok && Array.isArray(resp) ? resp : []);
        } catch (error) {
            console.error("Error fetching events attending:", error);
            toast.error("Failed to load events.");
            setAttendingEvents([]);
        }
    }

    // Get events user is hosting
    const getEventsHosting = async () => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/eventshosting`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            setHostingEvents(response.ok && Array.isArray(resp) ? resp : []);
        } catch (error) {
            console.error("Error fetching events hosting:", error);
            toast.error("Failed to load events.");
            setHostingEvents([]);
        }
    }

    // Get event by ID - returns the event or null
    const getEventById = async (id) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/getallevents/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const resp = await response.json();
            setEvent(resp);
            return response.ok ? resp : null;
        } catch (error) {
            console.error("Error fetching event by ID:", error);
            return null;
        }
    }

    // Add new event
    const addEvent = async (event) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/addevent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify(event)
            });

            const resp = await response.json();
            if (!response.ok) {
                const msg = resp.errors?.[0]?.msg || resp.msg || "Failed to create event.";
                toast.error(msg);
                throw new Error(msg);
            }
            setHostingEvents(prev => [...prev, resp]);
            getAllEvents();
        } catch (error) {
            if (!error.message?.startsWith("Failed")) {
                console.error("Error adding event:", error);
                toast.error("Failed to create event. Please try again.");
            }
            throw error;
        }
    }

    // Update event
    const updateEvent = async (id, updatedEvent) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/updateevent/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify(updatedEvent)
            });

            const resp = await response.json();
            // Backend returns { event } on success
            if (!response.ok) {
                const msg = resp.errors?.[0]?.msg || resp.msg || "Failed to update event.";
                toast.error(msg);
                throw new Error(msg);
            }
            setEvents(prev => prev.map(ev => ev._id === id ? resp.event ?? resp : ev));
            setHostingEvents(prev => prev.map(ev => ev._id === id ? resp.event ?? resp : ev));
            setEvent(resp.event ?? resp);
        } catch (error) {
            console.error("Error updating event:", error);
            toast.error("Failed to update event. Please try again.");
            throw error;
        }
    }

    // Delete event
    const deleteEvent = async (id) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/deleteevent/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            if (!response.ok) {
                const resp = await response.json();
                const msg = resp.msg || resp.error || "Failed to delete event.";
                toast.error(msg);
                throw new Error(msg);
            }
            setEvents(prev => prev.filter(ev => ev._id !== id));
            setHostingEvents(prev => prev.filter(ev => ev._id !== id));
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error("Failed to delete event. Please try again.");
            throw error;
        }
    }

    // Attend event
    const attendEvent = async (id) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/attendevent/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            if (!response.ok) {
                const msg = resp.msg || resp.errors?.[0]?.msg || "Failed to attend event.";
                toast.error(msg);
                throw new Error(msg);
            }
            setAttendingEvents(prev => [...prev, resp.event]);
        } catch (error) {
            if (!error.message?.startsWith("Failed")) {
                console.error("Error attending event:", error);
                toast.error("Failed to attend event. Please try again.");
            }
            throw error;
        }
    }

    // Unattend event
    const unattendEvent = async (id) => {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/event/unattendevent/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });

            const resp = await response.json();
            if (!response.ok) {
                const msg = resp.msg || resp.errors?.[0]?.msg || "Failed to unattend event.";
                toast.error(msg);
                throw new Error(msg);
            }
            setAttendingEvents(prev => prev.filter(ev => ev._id !== id));
        } catch (error) {
            if (!error.message?.startsWith("Failed")) {
                console.error("Error unattending event:", error);
                toast.error("Failed to unattend event. Please try again.");
            }
            throw error;
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
