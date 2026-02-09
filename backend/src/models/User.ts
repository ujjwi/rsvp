import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  date: Date;
  displayPicture: string;
  eventsHosting: mongoose.Types.ObjectId[];
  eventsAttending: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  displayPicture: {
    type: String,
    default: 'uploads\\Default_pfp.jpg',
  },
  eventsHosting: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  eventsAttending: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
});

const User: Model<IUser> = mongoose.model<IUser>('user', UserSchema);
export default User;
