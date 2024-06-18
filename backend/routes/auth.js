import { Router } from 'express';
const router = Router()
import User from '../models/User.js'
import {body, validationResult} from 'express-validator'
import multer from 'multer'; // to recieve a file(image) through form
import { v4 as uuidv4 } from 'uuid'; // for generating unique filenames
import bcrypt from 'bcryptjs'; // for salting passwords and creating hash from them
import jwt from 'jsonwebtoken'; // for saving user-session
import 'dotenv/config';
import fetchUser from '../middlewares/fetchUser.js' // using the fetchUser middleware

const jwt_secret = process.env.secret_key;

const storage = multer.diskStorage({
    // these functions will be executed whenever a new file is recieved
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4() + '-' + Date.now();
        const fileExtension = file.mimetype.split('/')[1];
        cb(null, uniqueSuffix + '.' + fileExtension); // generate unique filename
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); //accepts a file
    }
    else {
        cb(new Error('Image should be in jpeg or png format'), false); //rejects a file
    }
};

const upload = multer({
    storage : storage,
    limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: fileFilter
});

// Route 1 : creating a User using : POST "/api/auth/createuser" - No login required 
router.post('/createuser', upload.single('displayPicture'), [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have atleast 5 characters').isLength({min:5})
], async (req, res) => {
    // if there are errors, return the errors and status `Bad request`
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
    }

    //checking whether the email already exists
    try {
        let user = await User.findOne({email : req.body.email}); //using await because it is a promise so we have to wait for it to be resolved
        if(user) {
            return res.status(400).json({error : "A user with this email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // adding user to the database
        user = await User.create({
            name : req.body.name,
            password : secPass,
            email : req.body.email,
            displayPicture: req.file.path // save the path of the uploaded file
        })

        const data = {
            user : {
                id : user.id // sending user id as the promise to verify the user access to data
            }
        }
        const authToken = jwt.sign(data, jwt_secret);
        // console.log(authToken);
        res.json({authToken : authToken});

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
    // if there are errors, return the errors and status `Bad request`
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
    }

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({errors : 'Try logging in with correct credentials'});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare) {
            return res.status(400).json({errors : 'Try logging in with correct credentials'});
        }

        // If the verification is successfull,
        // We'll repeat the process we did just after an account was created
        const data = {
            user : {
                id : user.id // sending user id as the promise to verify the user access to data
            }
        }
        const authToken = jwt.sign(data, jwt_secret);
        res.json({authToken : authToken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

// Route 3 : Getting logged In User details using : POST "/api/auth/getuser" - login required 
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error!");
    }
})

export default router
