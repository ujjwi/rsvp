import { Router } from 'express';
const router = Router()
import User from '../models/User.js'
import {body, validationResult} from 'express-validator'
import multer from 'multer'; // to recieve a file(image) through form
import { v4 as uuidv4 } from 'uuid'; // for generating unique filenames

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

//creating a User using : POST "/api/auth/createuser" - No login required 
router.post('/createuser', upload.single('displayPicture'), [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have atleast 5 characters').isLength({min:5})
], async (req, res) => {
    // if there are errors, return the errors
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
        // adding user to the database
        user = await User.create({
            name : req.body.name,
            password : req.body.password,
            email : req.body.email,
            displayPicture: req.file.path // save the path of the uploaded file
        })
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

export default router
