const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// --- 1. VENUE ROUTES ---

// GET filtered venues
router.get('/venues', async (req, res) => {
    try {
        const { adminEmail } = req.query;
        if (!adminEmail) return res.status(200).json([]);
        
        const venues = await Venue.find({ adminEmail });
        res.status(200).json(venues);
    } catch (err) {
        res.status(500).json({ message: "Error fetching venues", error: err.message });
    }
});

// CREATE venue
router.post('/create-venue', async (req, res) => {
    try {
        const newVenue = new Venue(req.body);
        await newVenue.save();
        res.status(201).json({ message: "Venue created successfully!", venue: newVenue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE A VENUE
router.delete('/venues/:id', async (req, res) => {
    try {
        const deletedVenue = await Venue.findByIdAndDelete(req.params.id);
        if (!deletedVenue) return res.status(404).json({ message: "Venue not found" });
        res.status(200).json({ message: "Venue deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE A VENUE
router.put('/venues/:id', async (req, res) => {
    try {
        const updatedVenue = await Venue.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true } 
        );
        res.status(200).json(updatedVenue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. EVENT ROUTES ---

// GET events (Supports Admin filtering and User global view)
router.get('/events', async (req, res) => {
    try {
        const { adminEmail } = req.query;
        let query = {};
        if (adminEmail && adminEmail !== "undefined") {
            query = { adminEmail };
        } 
        const events = await Event.find(query);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Error fetching events", error: err.message });
    }
});

// CREATE event (FIXED PATH: changed from /create-event to /events)
router.post('/events', async (req, res) => {
    // 1. Look at your Terminal window after you click "Create"
    console.log("--- INCOMING DATA CHECK ---");
    console.log("Payload:", req.body); 

    try {
        const { adminEmail, adminOwner, name } = req.body;

        // 2. Manual check for required fields
        if (!adminEmail || !adminOwner || !name) {
            console.error("❌ Missing required fields:", { name, adminEmail, adminOwner });
            return res.status(400).json({ 
                message: `Missing required fields: ${!name ? 'Name ' : ''}${!adminEmail ? 'Email ' : ''}${!adminOwner ? 'Owner' : ''}` 
            });
        }

        const eventData = {
            ...req.body,
            languages: Array.isArray(req.body.languages) ? req.body.languages : [req.body.languages].filter(Boolean),
            cast: Array.isArray(req.body.cast) ? req.body.cast : [req.body.cast].filter(Boolean),
            activeVenues: Array.isArray(req.body.activeVenues) ? req.body.activeVenues : []
        };

        const newEvent = new Event(eventData);
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully!", event: newEvent });
    } catch (err) {
        console.error("❌ MONGOOSE ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// DELETE event
router.delete('/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE event (FIXED PATH: changed to match AdminDashboard calls)
router.put('/events/:id', async (req, res) => {
    try {
        const updatedData = {
            ...req.body,
            languages: Array.isArray(req.body.languages) ? req.body.languages : [],
            cast: Array.isArray(req.body.cast) ? req.body.cast : []
        };
        
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id, 
            { $set: updatedData }, 
            { new: true }
        );
        res.status(200).json(updatedEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. SHOW ROUTES ---

// CREATE show
router.post('/create-show', async (req, res) => {
    try {
        const { eventId, venueId, date, time, prices, adminEmail } = req.body;
        const newShow = new Show({
            event: eventId,
            venue: venueId,
            date,
            time,
            prices,
            adminEmail,
            bookedSeats: []
        });
        await newShow.save();
        res.status(201).json({ message: "Show scheduled successfully!", show: newShow });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET shows for a specific event
router.get('/shows/:eventId', async (req, res) => {
    try {
        const shows = await Show.find({ event: req.params.eventId }).populate('venue');
        res.status(200).json(shows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching shows", error: err.message });
    }
});

// GET specific show details
router.get('/show-details/:id', async (req, res) => {
    try {
        const show = await Show.findById(req.params.id).populate('event venue');
        res.json(show);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOCK SEATS
router.put('/shows/:id/lock-seats', async (req, res) => {
    try {
        const { seats } = req.body; 
        const show = await Show.findById(req.params.id);
        if (!show) return res.status(404).json({ message: "Show not found" });
        
        show.bookedSeats = [...new Set([...(show.bookedSeats || []), ...seats])];
        await show.save();
        res.status(200).json({ message: "Seats locked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. BOOKINGS ---

router.get('/bookings', async (req, res) => {
    try {
        const { adminEmail } = req.query;
        if (!adminEmail) return res.status(400).json({ message: "Admin email required" });

        const myEvents = await Event.find({ adminEmail }).select('_id');
        const myEventIds = myEvents.map(e => e._id.toString());

        const bookings = await Booking.find()
            .populate({
                path: 'showId',
                populate: { path: 'event venue' }
            })
            .sort({ createdAt: -1 });

        const myBookings = bookings.filter(b => 
            b.showId && 
            b.showId.event && 
            myEventIds.includes(b.showId.event._id.toString())
        );

        res.status(200).json(myBookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// --- 5. REVIEW MODERATION ---

router.get('/reviews', async (req, res) => {
    try {
        const { adminEmail } = req.query;
        if (!adminEmail) return res.status(400).json({ message: "Admin email required" });

        const myEvents = await Event.find({ adminEmail }).select('_id');
        const myEventIds = myEvents.map(e => e._id);

        const Review = mongoose.model('Review'); 
        const reviews = await Review.find({ 
            eventId: { $in: myEventIds },
            status: 'pending' 
        }).sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch reviews", details: err.message });
    }
});

router.put('/reviews/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const Review = mongoose.model('Review');
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(updatedReview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;