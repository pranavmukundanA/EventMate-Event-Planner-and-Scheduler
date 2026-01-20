const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

// Explicitly name the collection 'reviews'
module.exports = mongoose.model('Review', reviewSchema, 'reviews');