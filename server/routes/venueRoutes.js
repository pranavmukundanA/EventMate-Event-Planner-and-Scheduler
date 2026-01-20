const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// 1. SAVE VENUE (Attach Admin Ownership)
router.post('/add', async (req, res) => {
    try {
        const { name, location, capacity, adminEmail } = req.body;
        
        const newVenue = new Venue({
            name,
            location,
            capacity,
            adminEmail
        });

        await newVenue.save();
        res.status(201).json(newVenue);
    } catch (err) {
        res.status(500).json({ message: "Failed to create venue" });
    }
});

// 2. GET ADMIN-SPECIFIC VENUES
router.get('/admin/:email', async (req, res) => {
    try {
        const venues = await Venue.find({ adminEmail: req.params.email });
        res.json(venues);
    } catch (err) {
        res.status(500).json({ message: "Error fetching venues" });
    }
});