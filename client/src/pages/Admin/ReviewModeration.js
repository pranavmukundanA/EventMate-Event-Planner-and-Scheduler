import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReviewModeration.css'; // Adjust the path as needed

const ReviewModeration = ({ adminEmail }) => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch pending reviews for this admin
    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reviews/admin/pending/${adminEmail}`);
                setPendingReviews(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setLoading(false);
            }
        };
        fetchPending();
    }, [adminEmail]);

    // 2. Handle Approval or Rejection
    const handleModeration = async (reviewId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/reviews/moderate/${reviewId}`, { status });
            
            // Remove the moderated review from the UI list
            setPendingReviews(prev => prev.filter(r => r._id !== reviewId));
            alert(`Review ${status}!`);
        } catch (err) {
            alert("Action failed. Try again.");
        }
    };

    if (loading) return <p>Loading reviews...</p>;

    return (
        <div className="moderation-container">
            <h2>Review Moderation Panel</h2>
            {pendingReviews.length === 0 ? (
                <p>No pending reviews to moderate.</p>
            ) : (
                <div className="review-grid">
                    {pendingReviews.map((review) => (
                        <div key={review._id} className="review-card">
                            <h4>Event: {review.eventId?.name}</h4>
                            <p><strong>User:</strong> {review.userName} ({review.userEmail})</p>
                            <p><strong>Rating:</strong> {review.rating} / 5</p>
                            <p><strong>Comment:</strong> "{review.comment}"</p>
                            
                            <div className="action-buttons">
                                <button 
                                    onClick={() => handleModeration(review._id, 'approved')}
                                    className="approve-btn"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleModeration(review._id, 'rejected')}
                                    className="reject-btn"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewModeration;