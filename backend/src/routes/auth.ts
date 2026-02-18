import { Router, Request, Response } from 'express';
import User from '../models/User';
import Event from '../models/Event';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchUser from '../middlewares/fetchUser';
import { cloudinary, storage } from '../config/cloudinary';

const router = Router();
const jwt_secret = process.env.secret_key!;

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Image should be in jpeg or jpg or png format'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter,
});

router.post(
  '/createuser',
  upload.single('displayPicture'),
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have at least 5 characters').isLength({ min: 5 }),
    body('name', 'Name must not be empty').optional().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: 'A user with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
        displayPicture: req.file ? (req.file as any).path : 'https://res.cloudinary.com/dsu8wafxc/image/upload/v1720446094/Default_pfp_be3kok.png',
      });

      const data = { user: { _id: user._id } };
      const authToken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({ success, authToken, userId: user._id });
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send('Server error!');
    }
  }
);

router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ],
  async (req: Request, res: Response) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, errors: [{ msg: 'Try logging in with correct credentials' }] });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ success, errors: [{ msg: 'Try logging in with correct credentials' }] });
      }

      const data = { user: { _id: user._id } };
      const authToken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({ success, authToken, userId: user._id });
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send('Server error!');
    }
  }
);

router.get('/getuser/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).send('Server error!');
  }
});

router.put(
  '/updateuser',
  fetchUser,
  upload.single('displayPicture'),
  [
    body('email', 'Enter a valid email').optional().isEmail(),
    body('password', 'Password must have at least 5 characters').optional().isLength({ min: 5 }),
    body('name', 'Name must not be empty').optional().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const userId = req.user!._id;
      const { email, password, name } = req.body;
      const userUpdates: Record<string, unknown> = {};

      if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser && String(existingUser._id) !== String(userId)) {
          return res.status(400).json({ success, error: 'A user with this email already exists' });
        }
        userUpdates.email = email;
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        userUpdates.password = await bcrypt.hash(password, salt);
      }

      if (name) userUpdates.name = name;

      if (req.file) {
        const user = await User.findById(userId);
        if (user?.displayPicture && !user.displayPicture.includes('Default_pfp')) {
          const publicId = user.displayPicture.split('/').pop()?.split('.')[0];
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        userUpdates.displayPicture = (req.file as any).path;
      }

      const user = await User.findByIdAndUpdate(userId, { $set: userUpdates }, { new: true }).select('-password');
      success = true;
      res.json({ success, user });
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send('Server error!');
    }
  }
);

router.delete(
  '/deleteuser',
  fetchUser,
  [body('password', 'Password is required').exists()],
  async (req: Request, res: Response) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const userId = req.user!._id;
      const { password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success, error: 'User not found' });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ success, error: 'Incorrect password' });
      }

      await Event.updateMany({ attendees: userId }, { $pull: { attendees: userId } });
      await Event.deleteMany({ createdBy: userId });

      if (user.displayPicture && !user.displayPicture.includes('Default_pfp')) {
        const publicId = user.displayPicture.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }

      await User.findByIdAndDelete(userId);
      success = true;
      res.json({ success, message: 'Account deleted successfully' });
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send('Server error!');
    }
  }
);

export default router;
