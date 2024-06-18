import jwt from 'jsonwebtoken'

const fetchUser = (req, res, next) => {
    // get user from jwt token and add id to the req object
    const token = req.header('auth-token');
    if(!token) {
        res.status(401).send({error : "You can't access this page!! Authentication failed."})
    }

    try {
        const data = jwt.verify(token, process.env.secret_key);
        req.user = data.user;
        next(); // calling next function
    } catch (error) {
        res.status(401).send({error : "You can't access this page!! Authentication failed."})
    }
}

export default fetchUser;
