const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    adminEmail: { type: String, required: true },
    layout: { type: Array, default: [] } 
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);