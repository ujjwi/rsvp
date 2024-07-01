import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoURI = `mongodb+srv://${process.env.mongo_username}:${encodeURIComponent(process.env.mongo_password)}@cluster0.0wjtagt.mongodb.net/rsvp`;

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

export default connectToMongo;
