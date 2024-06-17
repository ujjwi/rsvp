import { Router } from 'express';
const router = Router()
import User from '../models/User.js'
import {body, validationResult} from 'express-validator'

//creating a User using : POST "/api/auth/createuser" - No login required 
router.post('/createuser', [
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
            displayPicture: req.body.displayPicture
        })
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

export default router
