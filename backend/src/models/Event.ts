import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  startdatetime: Date;
  enddatetime: Date;
  location: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
  },
  startdatetime: {
    type: Date,
    required: true,
  },
  enddatetime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);
export default Event;
