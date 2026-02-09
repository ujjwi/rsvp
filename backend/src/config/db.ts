import mongoose from 'mongoose';
import 'dotenv/config';

const mongoURI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.mongo_username}:${encodeURIComponent(process.env.mongo_password || '')}@cluster0.0wjtagt.mongodb.net/rsvp`;

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectToMongo;
