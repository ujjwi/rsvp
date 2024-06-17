import mongoose from 'mongoose';
const { Schema } = mongoose;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: "general"
    },
    datetime: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

export default mongoose.model('Event', EventSchema); // model name - Event, schema - EventSchema
