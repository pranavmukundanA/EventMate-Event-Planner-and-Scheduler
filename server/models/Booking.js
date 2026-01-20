const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    showId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    userEmail: { 
        type: String, 
        required: true,
        lowercase: true, 
        trim: true,
        index: true // Added index for faster user-specific lookups
    },
    seats: { 
        type: [String], 
        required: true 
    },
    basePrice: Number,
    serviceFee: Number,
    totalAmount: Number,
    bookingDate: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema, 'bookings');