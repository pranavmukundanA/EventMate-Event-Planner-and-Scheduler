const Booking = require('../models/Booking');

// 1. CREATE BOOKING: Prevents "undefined" or "guest" from entering the DB
exports.createBooking = async (req, res) => {
    try {
        const { showId, userEmail, seats, basePrice, serviceFee, totalAmount } = req.body;

        // CRITICAL CHECK: Block the booking if email is invalid/guest
        if (!userEmail || userEmail.includes("guest") || userEmail === "undefined") {
            return res.status(400).json({ 
                message: "A valid logged-in user email is required to book tickets." 
            });
        }

        const newBooking = new Booking({
            showId,
            userEmail: userEmail.toLowerCase().trim(),
            seats,
            basePrice,
            serviceFee,
            totalAmount
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking successful", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET USER BOOKINGS: Only fetches bookings for the specific logged-in user
exports.getUserBookings = async (req, res) => {
    try {
        const { email } = req.query; // Passed from Frontend (MyBookings.jsx)

        if (!email || email === "undefined") {
            return res.status(400).json({ message: "User email is missing." });
        }

        // Populating show and event details so the user sees Movie Name, Time, etc.
        const bookings = await Booking.find({ userEmail: email.toLowerCase() })
            .populate({
                path: 'showId',
                populate: { path: 'event' }
            })
            .sort({ bookingDate: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};