const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// 1. SAVE EVENT (Attach Admin Ownership)
router.post('/add', async (req, res) => {
    try {
        const { name, poster, description, adminEmail } = req.body;
        
        const newEvent = new Event({
            name,
            poster,
            description,
            adminEmail // This links the event to the specific admin
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({ message: "Failed to create event" });
    }
});

// 2. GET ADMIN-SPECIFIC EVENTS (Isolation)
router.get('/admin/:email', async (req, res) => {
    try {
        const events = await Event.find({ adminEmail: req.params.email });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Error fetching events" });
    }
});

// 3. GET ALL EVENTS (For the User Home Page)
// This matches: GET http://localhost:5000/api/admin/events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find({}); // Empty curly braces {} means "Find All"
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Error fetching all events" });
    }
});