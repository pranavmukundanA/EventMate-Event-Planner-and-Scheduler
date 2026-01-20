const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const mongoose = require('mongoose');

// 1. SAVE NEW BOOKING
router.post('/', async (req, res) => {
    try {
        const { showId, seats, userEmail, totalAmount, basePrice, serviceFee } = req.body;

        // PRE-CHECK: Optional but good - check if seats are already booked
        const show = await Show.findById(showId);
        const isAlreadyBooked = seats.some(seat => show.bookedSeats.includes(seat));
        if (isAlreadyBooked) {
            return res.status(400).json({ message: "One or more seats are already booked." });
        }

        const newBooking = new Booking({
            showId, 
            userEmail: userEmail.toLowerCase().trim(), 
            seats, 
            basePrice, 
            serviceFee, 
            totalAmount
        });

        // Save Booking
        const savedBooking = await newBooking.save();

        // Update Show Seats
        await Show.findByIdAndUpdate(showId, {
            $push: { bookedSeats: { $each: seats } }
        });

        res.status(201).json(savedBooking);
    } catch (err) {
        console.error("Booking POST Error:", err);
        res.status(500).json({ message: "Transaction Failed", error: err.message });
    }
});

// 2. GET USER-SPECIFIC BOOKINGS
router.get('/user/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        // The core logic here is perfect: userEmail filter ensures isolation
        const bookings = await Booking.find({ userEmail: email })
            .populate({
                path: 'showId',
                populate: { path: 'event venue' } 
            })
            .sort({ createdAt: -1 });
            
        res.json(bookings);
    } catch (err) {
        console.error("Booking GET Error:", err);
        res.status(500).json({ message: "Error fetching history" });
    }
});

// 3. GET REMINDERS
router.get('/reminders/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        const userBookings = await Booking.find({ userEmail: email })
            .populate({ path: 'showId', populate: { path: 'event' } });
            
        const now = new Date();
        const fortyEightHours = new Date(now.getTime() + (48 * 60 * 60 * 1000));

        const alerts = userBookings
            .filter(b => {
                if (!b.showId || !b.showId.date) return false;
                // Improved date parsing for consistency
                const eventDate = new Date(`${b.showId.date}T${b.showId.time || '00:00:00'}`);
                return eventDate > now && eventDate <= fortyEightHours;
            })
            .map(b => ({ 
                eventName: b.showId.event?.name || "Event", 
                timeLabel: `${b.showId.time} on ${new Date(b.showId.date).toLocaleDateString()}` 
            }));
            
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reminders" });
    }
});

// 4. DELETE/CANCEL
router.delete('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // RELEASE SEATS: Remove booked seats from the Show
        if (booking.showId) {
            await Show.findByIdAndUpdate(booking.showId, {
                $pull: { bookedSeats: { $each: booking.seats } }
            });
        }

        await Booking.findByIdAndDelete(bookingId);
        res.status(200).json({ message: "Booking successfully cancelled and seats released" });
    } catch (err) {
        console.error("Cancellation Error:", err);
        res.status(500).json({ error: "Server Error during cancellation" });
    }
});

module.exports = router;