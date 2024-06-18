import { Router } from 'express';
const router = Router()
import Event from '../models/Event.js'
import User from '../models/User.js'
import fetchUser from '../middlewares/fetchUser.js'
import {body, validationResult} from 'express-validator'
import mongoose from 'mongoose';


// Route 1 : Get all the events that user has marked to visit : GET "/api/auth/eventsvisiting" - login required 
router.get('/eventsvisiting', fetchUser, async (req, res) => {
    try {
        const eventsVisiting = await Event.find({ attendees: req.user.id });
        res.json(eventsVisiting);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

// Route 2 : Get all the events that user is hosting : GET "/api/auth/eventsvisiting" - login required 
router.get('/eventshosting', fetchUser, async (req, res) => {
    try {
        const eventsHosting = await Event.find({createdBy : req.user.id});
        res.json(eventsHosting);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

// Route 3: Get all the events: GET "/api/auth/getallevents" - login not required
router.get('/getallevents', async (req, res) => {
    try {
        const allEvents = await Event.find();
        res.json(allEvents);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 4: Get event by id : GET "/api/auth/getallevents/:id" - login not required
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


// Route 5: Add a new event using: POST "/api/auth/addevent" - login required 
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
            createdBy: req.user.id
        });

        const savedEvent = await event.save();

        // Update the user's eventsHosting array
        const user = await User.findById(req.user.id);
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

// Route 6: Add an event to eventsAttending list using the Attending button - login required 
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
        if (event.attendees.includes(req.user.id)) {
            return res.status(400).json({ msg: 'User is already attending this event' });
        }

        // Add the user to the event's attendees list
        event.attendees.push(req.user.id);
        await event.save();

        // Add the event to the user's eventsAttending list
        const user = await User.findById(req.user.id);
        if (!user) {
            // Rollback the event update if user not found
            event.attendees.pull(req.user.id);
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

export default router
