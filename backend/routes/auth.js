import { Router } from 'express';
const router = Router()
import User from '../models/User.js'
import Event from '../models/Event.js'
import { body, validationResult } from 'express-validator'
import multer from 'multer'; // to receive a file(image) through form
import { v4 as uuidv4 } from 'uuid'; // for generating unique filenames
import bcrypt from 'bcryptjs'; // for salting passwords and creating hash from them
import jwt from 'jsonwebtoken'; // for saving user-session
import 'dotenv/config';
import fs from 'fs'; // for file system operations
import fetchUser from '../middlewares/fetchUser.js' // using the fetchUser middleware

const jwt_secret = process.env.secret_key;

const storage = multer.diskStorage({
    // these functions will be executed whenever a new file is received
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4() + '-' + Date.now();
        const fileExtension = file.mimetype.split('/')[1];
        cb(null, uniqueSuffix + '.' + fileExtension); // generate unique filename
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); //accepts a file
    }
    else {
        cb(new Error('Image should be in jpeg or png format'), false); //rejects a file
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: fileFilter
});

// Route 1 : creating a User using : POST "/api/auth/createuser" - No login required 
router.post('/createuser', upload.single('displayPicture'), [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have at least 5 characters').isLength({ min: 5 }),
    body('name', 'Name must not be empty').optional().isLength({ min: 1 })
], async (req, res) => {
    let success = false;

    // if there are errors, return the errors and status `Bad request`
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    //checking whether the email already exists
    try {
        let user = await User.findOne({ email: req.body.email }); //using await because it is a promise so we have to wait for it to be resolved
        if (user) {
            return res.status(400).json({ success, error: "A user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // adding user to the database
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            displayPicture: req.file ? req.file.path : "uploads/Default_pfp.jpg" // use default if no file
        })

        const data = {
            user: {
                id: user.id // sending user id as the promise to verify the user access to data
            }
        }
        const authToken = jwt.sign(data, jwt_secret);
        // console.log(authToken);
        success = true;
        res.json({ success, authToken: authToken });

        // res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

// Route 2 :Authenticating a User using : POST "/api/auth/login" - No login required 
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success = false;

    // if there are errors, return the errors and status `Bad request`
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, errors: 'Try logging in with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, errors: 'Try logging in with correct credentials' });
        }

        // If the verification is successful,
        // We'll repeat the process we did just after an account was created
        const data = {
            user: {
                id: user.id // sending user id as the promise to verify the user access to data
            }
        }
        const authToken = jwt.sign(data, jwt_secret);

        success = true;
        res.json({ success, authToken: authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

// Route 3 : Getting logged In User details using : GET "/api/auth/getuser/:id" - no login required 
router.get('/getuser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

// Route 4: Update user details using : PUT "/api/auth/updateuser" - login required 
router.put('/updateuser', fetchUser, upload.single('displayPicture'), [
    body('email', 'Enter a valid email').optional().isEmail(),
    body('password', 'Password must have at least 5 characters').optional().isLength({ min: 5 }),
    body('name', 'Name must not be empty').optional().isLength({ min: 1 })
], async (req, res) => {
    let success = false;

    // If there are errors, return the errors and status `Bad request`
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const userId = req.user.id;
        const { email, password, name } = req.body;
        const userUpdates = {};

        // Check if email is being updated
        if (email) {
            let existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ success, error: 'A user with this email already exists' });
            }
            userUpdates.email = email;
        }

        // Check if password is being updated
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(password, salt);
            userUpdates.password = secPass;
        }

        // Check if name is being updated
        if (name) {
            userUpdates.name = name;
        }

        // Check if display picture is being updated
        if (req.file) {
            const user = await User.findById(userId);
            if (user.displayPicture && user.displayPicture !== "uploads/Default_pfp.jpg") {
                fs.unlink(user.displayPicture, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            userUpdates.displayPicture = req.file.path;
        }

        // Update the user details
        let user = await User.findByIdAndUpdate(userId, { $set: userUpdates }, { new: true }).select("-password");
        success = true;
        res.json({ success, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

// Route 5: Delete user account using: DELETE "/api/auth/deleteuser" - login required
router.delete('/deleteuser', fetchUser, [
    body('password', 'Password is required').exists()
], async (req, res) => {
    let success = false;

    // If there are errors, return the errors and status `Bad request`
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Find the user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success, error: 'User not found' });
        }

        // Compare the provided password with the stored password
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: 'Incorrect password' });
        }

        // Remove user from any events they are attending
        await Event.updateMany(
            { attendees: userId },
            { $pull: { attendees: userId } }
        );

        // Remove user from any events they are hosting
        await Event.updateMany(
            { createdBy: userId },
            { $unset: { createdBy: "" } }
        );

        // Delete the user's display picture if it's not the default one
        if (user.displayPicture && user.displayPicture !== "uploads/Default_pfp.jpg") {
            fs.unlink(user.displayPicture, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        success = true;
        res.json({ success, message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
});

export default router;
