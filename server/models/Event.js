const mongoose = require('mongoose');

// 1. Define Review Schema FIRST
const reviewSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
});

// 2. Define Event Schema SECOND
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    poster: { type: String }, 
    duration: { type: String },
    genre: { type: String },
    languages: [String],
    cast: [String],
    activeVenues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
    reviews: [reviewSchema], // Embedded sub-document
    adminOwner: { type: String, required: true },
    adminEmail: { type: String, required: true },
    averageRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);