import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    displayPicture: {
        type: String,
        default: 'defaultImagePath.jpg' // path to default image
    },
    eventsHosting: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }],
    eventsAttending: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

export default mongoose.model('User', UserSchema); // model name - User, schema - UserSchema
