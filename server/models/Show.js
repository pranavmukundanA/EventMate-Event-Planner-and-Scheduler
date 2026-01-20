const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    adminEmail: { type: String, required: true },
    prices: {
        gold: Number,
        silver: Number,
        bronze: Number
    },
    bookedSeats: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);