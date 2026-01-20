const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User'); // Ensure User model is imported
const mongoose = require('mongoose');

// 1. GET USER REMINDERS
// Checks for bookings occurring in the next 5h, 24h, or 48h
router.get('/reminders/:email', async (req, res) => {
    try {
        const bookings = await Booking.find({ userEmail: req.params.email })
            .populate({
                path: 'showId',
                populate: { path: 'event venue' }
            });

        const now = new Date();
        const reminders = bookings.map(b => {
            if (!b.showId) return null;
            const eventDateTime = new Date(`${b.showId.date} ${b.showId.time}`);
            const diffInMs = eventDateTime - now;
            const diffInHours = diffInMs / (1000 * 60 * 60);

            let type = null;
            if (diffInHours > 0 && diffInHours <= 5) type = "5 hours before";
            else if (diffInHours > 0 && diffInHours <= 24) type = "1 day before";
            else if (diffInHours > 0 && diffInHours <= 48) type = "2 days before";

            return type ? { eventName: b.showId.event.name, timeLabel: type } : null;
        }).filter(item => item !== null);

        res.status(200).json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. UPDATE NOTIFICATION PREFERENCES
// Saves the toggle states (Email/Push) from your UI
router.put('/update-notifications', async (req, res) => {
    try {
        const { email, notificationSettings } = req.body;
        // This assumes you have a User model with a notificationSettings field
        await User.findOneAndUpdate(
            { email },
            { $set: { notificationSettings } },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: "Preferences saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. BOOK SEATS
router.post('/book-seats', async (req, res) => {
    try {
        const { showId, seats, totalAmount, userEmail, basePrice, serviceFee } = req.body;

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show not found" });

        const isAlreadyBooked = seats.some(seat => show.bookedSeats.includes(seat));
        if (isAlreadyBooked) {
            return res.status(400).json({ message: "One or more seats are already taken!" });
        }

        const newBooking = new Booking({
            showId: new mongoose.Types.ObjectId(showId),
            userEmail, 
            seats,
            basePrice,
            serviceFee,
            totalAmount
        });
        await newBooking.save();

        show.bookedSeats.push(...seats);
        await show.save();

        res.status(201).json({ message: "Booking confirmed!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. CANCEL BOOKING (The 5-Hour Logic)
router.delete('/cancel-booking/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId).populate('showId');
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const eventDateTime = new Date(`${booking.showId.date} ${booking.showId.time}`);
        const now = new Date();
        const hoursDiff = (eventDateTime - now) / (1000 * 60 * 60);

        if (hoursDiff < 5) {
            return res.status(400).json({ message: "Cancellation period expired (5-hour limit)." });
        }

        // Remove the specific seats from the Show record
        await Show.findByIdAndUpdate(booking.showId._id, {
            $pull: { bookedSeats: { $each: booking.seats } }
        });

        await Booking.findByIdAndDelete(req.params.bookingId);
        res.status(200).json({ message: "Booking cancelled and seats released." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. GET SHOWS BY MOVIE ID
router.get('/shows/:movieId', async (req, res) => {
    try {
        const shows = await Show.find({ event: req.params.movieId })
            .populate('venue')
            .populate('event');
        res.json(shows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;