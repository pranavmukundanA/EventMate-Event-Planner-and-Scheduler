const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Event = require('../models/Event');

router.post('/', async (req, res) => {
    try {
        const { eventId, userEmail, userName, rating, comment } = req.body;

        // 1. Updated Strict Check: Include 'comment'
        if (!eventId || !userEmail || !userName || !rating || !comment) {
            return res.status(400).json({ 
                message: "Missing fields", 
                details: { eventId: !!eventId, userEmail: !!userEmail, userName: !!userName, rating: !!rating, comment: !!comment }
            });
        }

        // 2. Prevent Duplicate Reviews
        const existing = await Review.findOne({ eventId, userEmail });
        if (existing) {
            return res.status(400).json({ message: "You have already submitted a review for this show." });
        }

        const newReview = new Review({
            eventId,
            userEmail,
            userName,
            rating: Number(rating), // Ensure it's a number
            comment,
            status: 'pending'
        });

        await newReview.save();
        res.status(201).json({ message: "Review sent to Admin for approval." });
    } catch (err) {
        // Detailed error logging for you to see in the terminal
        console.error("DB Save Error:", err.message);
        res.status(500).json({ message: "Database Error", error: err.message });
    }
});

router.put('/moderate/:reviewId', async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const review = await Review.findById(req.params.reviewId);

        if (!review) return res.status(404).json({ message: "Review not found" });

        review.status = status;
        await review.save();

        if (status === 'approved') {
            const Event = require('../models/Event');
            // Recalculate based on all approved reviews for this event
            const allApproved = await Review.find({ eventId: review.eventId, status: 'approved' });
            const avg = allApproved.reduce((acc, r) => r.rating + acc, 0) / allApproved.length;

            await Event.findByIdAndUpdate(review.eventId, {
                averageRating: avg.toFixed(1),
                numReviews: allApproved.length
            });
        }
        res.json({ message: `Review ${status}!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/admin/pending/:adminEmail', async (req, res) => {
    try {
        // FIXED: Changed 'axios.find' to 'Review.find'
        // We find reviews with status 'pending'
        const reviews = await Review.find({ status: 'pending' }).populate('eventId');
        res.json(reviews);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

router.get('/event/:eventId', async (req, res) => {
    try {
        const reviews = await Review.find({ 
            eventId: req.params.eventId, 
            status: 'approved' 
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;