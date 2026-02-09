import { Router, Request, Response } from 'express';
import Event from '../models/Event';
import User from '../models/User';
import fetchUser from '../middlewares/fetchUser';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const router = Router();

router.get('/eventsvisiting', fetchUser, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).populate('eventsAttending');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.eventsAttending);
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.get('/eventshosting', fetchUser, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).populate('eventsHosting');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.eventsHosting);
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.get('/eventsvisiting/:userId', async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ attendees: req.params.userId });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch attending events' });
  }
});

router.get('/eventshosting/:userId', async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ createdBy: req.params.userId });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch hosting events' });
  }
});

router.get('/getallevents', async (_req: Request, res: Response) => {
  try {
    const currentTime = new Date();
    const allEvents = await Event.find({ enddatetime: { $gt: currentTime } }).sort({ startdatetime: 1 });
    res.json(allEvents);
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.get('/getallevents/:id', async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.post(
  '/addevent',
  fetchUser,
  [
    body('title', 'Title must not be empty').isLength({ min: 1 }),
    body('description', 'Description must have at least 2 characters').isLength({ min: 2 }),
    body('startdatetime', 'Invalid start date and time').isISO8601(),
    body('enddatetime', 'Invalid end date and time').isISO8601(),
    body('location', 'Location must not be empty').isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { title, startdatetime, enddatetime, location, description } = req.body;
      if (new Date(startdatetime) >= new Date(enddatetime)) {
        return res.status(400).json({ errors: [{ msg: 'End date and time must be after start date and time' }] });
      }

      const event = new Event({
        title,
        startdatetime,
        enddatetime,
        location,
        description,
        createdBy: req.user!._id,
      });
      const savedEvent = await event.save();

      const user = await User.findById(req.user!._id);
      if (!user) {
        await Event.findByIdAndDelete(savedEvent._id);
        return res.status(404).json({ msg: 'User not found' });
      }
      await User.findByIdAndUpdate(req.user!._id, { $push: { eventsHosting: savedEvent._id } });

      res.json(savedEvent);
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send('Server error!');
    }
  }
);

router.post('/attendevent/:id', fetchUser, async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    const userId = req.user!._id;
    if (event.attendees.some((a: mongoose.Types.ObjectId) => a.toString() === userId.toString())) {
      return res.status(400).json({ msg: 'User is already attending this event' });
    }

    await Event.findByIdAndUpdate(req.params.id, { $push: { attendees: userId } });
    const user = await User.findById(userId);
    if (!user) {
      await Event.findByIdAndUpdate(req.params.id, { $pull: { attendees: userId } });
      return res.status(404).json({ msg: 'User not found' });
    }
    await User.findByIdAndUpdate(userId, { $push: { eventsAttending: event._id } });
    const updatedEvent = await Event.findById(req.params.id);
    const updatedUser = await User.findById(userId);

    res.json({ event: updatedEvent ?? event, user: updatedUser ?? user });
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.put(
  '/updateevent/:id',
  fetchUser,
  [
    body('title', 'Title must not be empty').optional().isLength({ min: 1 }),
    body('description', 'Description must have at least 2 characters').optional().isLength({ min: 2 }),
    body('startdatetime', 'Invalid start date and time').optional().isISO8601(),
    body('enddatetime', 'Invalid end date and time').optional().isISO8601(),
    body('location', 'Location must not be empty').optional().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { title, startdatetime, enddatetime, location, description } = req.body;
      if (startdatetime && enddatetime && new Date(startdatetime) >= new Date(enddatetime)) {
        return res.status(400).json({ errors: [{ msg: 'End date and time must be after start date and time' }] });
      }

      let event = await Event.findById(req.params.id);
      if (!event) return res.status(404).send('Event not found');
      if (event.createdBy.toString() !== req.user!._id.toString()) {
        return res.status(401).send('Unauthorized action');
      }

      const updates: Record<string, unknown> = {};
      if (title) updates.title = title;
      if (startdatetime) updates.startdatetime = startdatetime;
      if (enddatetime) updates.enddatetime = enddatetime;
      if (location) updates.location = location;
      if (description) updates.description = description;

      event = await Event.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
      res.json({ event });
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send('Server error!');
    }
  }
);

router.delete('/deleteevent/:id', fetchUser, async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send('Event not found');
    if (event.createdBy.toString() !== req.user!._id.toString()) {
      return res.status(401).send('Unauthorized action');
    }

    await Event.findByIdAndDelete(req.params.id);
    await User.updateOne({ _id: req.user!._id }, { $pull: { eventsHosting: req.params.id } });
    await User.updateMany({ eventsAttending: req.params.id }, { $pull: { eventsAttending: req.params.id } });

    res.json({ success: 'Event deleted', event });
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.delete('/unattendevent/:id', fetchUser, async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid event ID' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    const userId = req.user!._id;
    if (!event.attendees.some((a: mongoose.Types.ObjectId) => a.toString() === userId.toString())) {
      return res.status(400).json({ msg: 'User is not attending this event' });
    }

    await Event.findByIdAndUpdate(req.params.id, { $pull: { attendees: userId } });
    const user = await User.findById(userId);
    if (!user) {
      await Event.findByIdAndUpdate(req.params.id, { $push: { attendees: userId } });
      return res.status(404).json({ msg: 'User not found' });
    }
    await User.findByIdAndUpdate(userId, { $pull: { eventsAttending: event._id } });
    const updatedEvent = await Event.findById(req.params.id);
    const updatedUser = await User.findById(userId);

    res.json({ event: updatedEvent ?? event, user: updatedUser ?? user });
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

export default router;
