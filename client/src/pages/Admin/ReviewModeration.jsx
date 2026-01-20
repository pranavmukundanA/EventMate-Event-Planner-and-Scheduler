import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Star } from 'lucide-react';

const ReviewModeration = () => {
    const [pendingReviews, setPendingReviews] = useState([]);

    // 1. Unified Fetch Function name
    const fetchReviews = async () => {
    // This matches what we set in Login.jsx
    const email = localStorage.getItem('userEmail'); 
    const token = localStorage.getItem('token');

    if (!email) return;

    try {
        // We use the route we just added to the backend
        const res = await axios.get(`http://localhost:5000/api/admin/reviews?adminEmail=${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setPendingReviews(res.data);
    } catch (err) {
        console.error("Error fetching reviews:", err);
    }
    };

    // 2. The missing Handle Action Function (Approve/Reject)
    const handleAction = async (reviewId, action) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/api/admin/reviews/${reviewId}`, 
                { status: action === 'approve' ? 'approved' : 'rejected' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Review ${action}ed!`);
            fetchReviews(); // Refresh the list
        } catch (err) {
            console.error("Action Error:", err);
            alert("Failed to update review status.");
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <div className="p-6 text-white">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4">Review Moderation Panel</h2>
            
            {pendingReviews.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">No pending reviews to moderate.</p>
            ) : (
                <div className="space-y-4">
                    {pendingReviews.map((review) => (
                        <div key={review._id} className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 flex justify-between items-center hover:border-[#0d9488] transition-colors">
                            <div>
                                <h4 className="font-bold text-[#0d9488] flex items-center gap-2">
                                    {review.userName} 
                                    <span className="text-[10px] text-gray-500 font-normal">({review.userEmail})</span>
                                </h4>
                                <p className="text-sm text-gray-300 mt-1 italic">"{review.comment}"</p>
                                <div className="flex text-yellow-500 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={12} 
                                            fill={i < review.rating ? "currentColor" : "none"} 
                                            className={i < review.rating ? "text-yellow-500" : "text-gray-600"}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button 
                                    onClick={() => handleAction(review._id, 'approve')} 
                                    className="p-3 bg-emerald-600/20 text-emerald-500 border border-emerald-600/30 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                    title="Approve Review"
                                >
                                    <Check size={18} />
                                </button>
                                <button 
                                    onClick={() => handleAction(review._id, 'reject')} 
                                    className="p-3 bg-red-600/20 text-red-500 border border-red-600/30 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                    title="Reject Review"
                                >
                                    <X size={18} />
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