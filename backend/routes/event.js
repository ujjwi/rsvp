import { Router } from 'express';
const router = Router()
import Event from '../models/Event.js'
import User from '../models/User.js'
import fetchUser from '../middlewares/fetchUser.js'
import {body, validationResult} from 'express-validator'
import mongoose from 'mongoose';


// Route 1 : Get all the events that user has marked to visit : GET "/api/event/eventsvisiting" - login required 
router.get('/eventsvisiting/:userId', async (req, res) => {
    try {
      const events = await Event.find({ attendees: req.params.userId });
      res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch attending events' });
    }
});

// Route 2 : Get all the events that user is hosting : GET "/api/event/eventsvisiting" - login required 
router.get('/eventshosting/:userId', async (req, res) => {
    try {
      const events = await Event.find({ createdBy: req.params.userId });
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch hosting events' });
    }
});

// Route 3: Get all the events: GET "/api/event/getallevents" - login not required
router.get('/getallevents', async (req, res) => {
    try {
        const currentTime = new Date();
        // Find all events that have not finished, and sort them by start time in ascending order
        const allEvents = await Event.find({ enddatetime: { $gt: currentTime } }).sort({ startdatetime: 1 });
        res.json(allEvents);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 4: Get event by id : GET "/api/event/getallevents/:id" - login not required
router.get('/getallevents/:id', async (req, res) => {
    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!isValidObjectId) {
            return res.status(400).json({ msg: 'Invalid event ID' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});


// Route 5: Add a new event using: POST "/api/event/addevent" - login required 
router.post('/addevent', fetchUser, [
    body('title', 'Title must not be empty').isLength({ min: 1 }),
    body('description', 'Description must have at least 2 characters').isLength({ min: 2 }),
    body('startdatetime', 'Invalid start date and time').isISO8601(),
    body('enddatetime', 'Invalid end date and time').isISO8601(),
    body('location', 'Location must not be empty').isLength({ min: 1 }),
], async (req, res) => {
    try {
        const { title, startdatetime, enddatetime, location, description } = req.body;

        // If there are errors, return the errors and status `Bad request`
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Ensure the enddatetime is after the startdatetime
        if (new Date(startdatetime) >= new Date(enddatetime)) {
            return res.status(400).json({ errors: [{ msg: 'End date and time must be after start date and time' }] });
        }

        const event = new Event({
            title,
            startdatetime,
            enddatetime,
            location,
            description,
            createdBy: req.user._id
        });

        const savedEvent = await event.save();

        // Update the user's eventsHosting array
        const user = await User.findById(req.user._id);
        if (!user) {
            // Rollback the event creation if user not found
            await Event.findByIdAndDelete(savedEvent._id);
            return res.status(404).json({ msg: 'User not found' });
        }
        user.eventsHosting.push(savedEvent._id);
        await user.save();
        
        res.json(savedEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 6: Add an event to eventsAttending list using: POST "/api/event/attendevent/:id"  - login required 
router.post('/attendevent/:id', fetchUser, async (req, res) => {
    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!isValidObjectId) {
            return res.status(400).json({ msg: 'Invalid event ID' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check if the user is already attending the event
        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ msg: 'User is already attending this event' });
        }

        // Add the user to the event's attendees list
        event.attendees.push(req.user._id);
        await event.save();

        // Add the event to the user's eventsAttending list
        const user = await User.findById(req.user._id);
        if (!user) {
            // Rollback the event update if user not found
            event.attendees.pull(req.user._id);
            await event.save();
            return res.status(404).json({ msg: 'User not found' });
        }
        user.eventsAttending.push(event._id);
        await user.save();

        res.json({ event, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 7 : Update an existing event using : PUT "/api/event/updateevent/:id" - login required 
router.put('/updateevent/:id', fetchUser, [
    body('title', 'Title must not be empty').optional().isLength({ min: 1 }),
    body('description', 'Description must have at least 2 characters').optional().isLength({ min: 2 }),
    body('startdatetime', 'Invalid start date and time').optional().isISO8601(),
    body('enddatetime', 'Invalid end date and time').optional().isISO8601(),
    body('location', 'Location must not be empty').optional().isLength({ min: 1 })
], async (req, res) => {
    try {
        const { title, startdatetime, enddatetime, location, description } = req.body;

        // If there are errors, return the errors and status `Bad request`
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Ensure the enddatetime is after the startdatetime if both are provided
        if (startdatetime && enddatetime && new Date(startdatetime) >= new Date(enddatetime)) {
            return res.status(400).json({ errors: [{ msg: 'End date and time must be after start date and time' }] });
        }

        // Find the event to be updated
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send("Event not found");
        }

        // Authorization check
        if (event.createdBy.toString() !== req.user._id) {
            return res.status(401).send("Unauthorized action");
        }

        // Create a new event object with only the fields that need to be updated
        const newEvent = {};
        if (title) newEvent.title = title;
        if (startdatetime) newEvent.startdatetime = startdatetime;
        if (enddatetime) newEvent.enddatetime = enddatetime;
        if (location) newEvent.location = location;
        if (description) newEvent.description = description;

        // Update the event
        event = await Event.findByIdAndUpdate(req.params.id, { $set: newEvent }, { new: true });
        res.json({ event });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 8 : Delete an existing event using : DELETE "/api/event/deleteevent/:id" - login required 
router.delete('/deleteevent/:id', fetchUser, async (req, res) => {
    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!isValidObjectId) {
            return res.status(400).json({ msg: 'Invalid event ID' });
        }

        // Find the event to be deleted
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send("Event not found");
        }

        // Authorization check
        if (event.createdBy.toString() !== req.user._id) {
            return res.status(401).send("Unauthorized action");
        }

        // Delete the event
        await Event.findByIdAndDelete(req.params.id);

        // Remove the event from the user's eventsHosting array
        await User.updateOne(
            { _id: req.user._id },
            { $pull: { eventsHosting: req.params.id } }
        );

        // Remove the event from the eventsAttending list of all users who had marked this event to attend
        await User.updateMany(
            { eventsAttending: req.params.id },
            { $pull: { eventsAttending: req.params.id } }
        );

        res.json({ success: "Event deleted", event: event });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 9 : Remove an event from the user's eventsAttending list : DELETE "/api/event/unattendevent/:id" - login required
router.delete('/unattendevent/:id', fetchUser, async (req, res) => {
    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!isValidObjectId) {
            return res.status(400).json({ msg: 'Invalid event ID' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check if the user is attending the event
        if (!event.attendees.includes(req.user._id)) {
            return res.status(400).json({ msg: 'User is not attending this event' });
        }

        // Remove the user from the event's attendees list
        event.attendees.pull(req.user._id);
        await event.save();

        // Remove the event from the user's eventsAttending list
        const user = await User.findById(req.user._id);
        if (!user) {
            // Rollback the event update if user not found
            event.attendees.push(req.user._id);
            await event.save();
            return res.status(404).json({ msg: 'User not found' });
        }
        user.eventsAttending.pull(event._id);
        await user.save();

        res.json({ event, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

export default router
