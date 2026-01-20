const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
    try {
        const { 
            name, poster, duration, genre, 
            languages, cast, adminOwner, adminEmail, 
            activeVenues, description, releaseDate 
        } = req.body;

        // Validation: Ensure required fields exist
        if (!name || !adminEmail) {
            return res.status(400).json({ message: "Event Name and Admin Email are required." });
        }

        const newEvent = new Event({
            name,
            poster, // This is likely the cause if index.js limit isn't set
            duration,
            description,
            genre,
            languages: Array.isArray(languages) ? languages : [],
            cast: Array.isArray(cast) ? cast : [],
            adminOwner: adminOwner || "Admin",
            adminEmail: adminEmail,
            activeVenues: Array.isArray(activeVenues) ? activeVenues : [],
            releaseDate: releaseDate || Date.now() 
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error("Mongoose Error:", error);
        // This will send the specific field that failed validation (e.g. "path 'name' is required")
        res.status(400).json({ message: error.message });
    }
};

// 2. GET ADMIN EVENTS: Corrected the filter key
exports.getAdminEvents = async (req, res) => {
    try {
        const { adminEmail } = req.query;

        if (!adminEmail || adminEmail === "undefined") {
            return res.status(400).json({ message: "Admin Email is required for filtering" });
        }

        // FIXED: Filter by adminEmail, NOT adminOwner
        const events = await Event.find({ adminEmail: adminEmail });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};