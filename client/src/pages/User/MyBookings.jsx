import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, MapPin, Clock, Star, MessageSquare, ExternalLink, X, Bell, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [settings, setSettings] = useState({ email: true, push: true });

    // FIX: Fallback logic so bookings aren't empty if email is undefined
    const getActiveEmail = () => {
        const stored = localStorage.getItem('userEmail') || localStorage.getItem('email');
        if (!stored || stored === "undefined" || stored === "null") {
            return "guest_user@example.com";
        }
        return stored;
    };

const userEmail = localStorage.getItem('userEmail');

    const fetchUserData = useCallback(async () => {
        // If the user isn't logged in, don't fetch anything, just redirect
        if (!userEmail || userEmail === "undefined") {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const timestamp = new Date().getTime();
            
            // 2. Use the REAL email from localStorage
            const [bookRes, remRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/bookings/user/${userEmail}?t=${timestamp}`),
                axios.get(`http://localhost:5000/api/bookings/reminders/${userEmail}?t=${timestamp}`)
            ]);

            setBookings(Array.isArray(bookRes.data) ? bookRes.data : []);
            setReminders(Array.isArray(remRes.data) ? remRes.data : []);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [userEmail, navigate]);

    // 3. Update useEffect to include navigate
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const toggleSetting = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        try {
            await axios.put('http://localhost:5000/api/user/update-notifications', {
                email: userEmail,
                notificationSettings: newSettings
            });
        } catch (err) {
            console.error("Failed to save settings");
        }
    };

    const canCancel = (dateStr, timeStr) => {
        if (!dateStr) return false;
        try {
            const eventDateTime = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
            const now = new Date();
            const diffInHours = (eventDateTime - now) / (1000 * 60 * 60);
            return diffInHours >= 5; 
        } catch (e) {
            return false;
        }
    };

    const handleCancel = async (id) => {
        if (!id) return alert("Error: Booking ID is missing.");
        if (!window.confirm("Confirm cancellation? This will release your seats back to the venue.")) return;
        try {
            const response = await axios.delete(`http://localhost:5000/api/bookings/${id}`);
            if (response.status === 200) {
                setBookings(prev => prev.filter(b => b._id !== id));
                fetchUserData();
                alert("Success: Ticket cancelled and seats released.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Check server logs.";
            alert(`Cancellation failed: ${errorMsg}`);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        
        if (!review.comment.trim()) {
            return alert("Please enter a comment before submitting.");
        }

        try {
            const email = getActiveEmail();
            const name = localStorage.getItem('userName') || "Guest User"; 

            const reviewData = {
                eventId: selectedEvent,
                userEmail: email,
                userName: name,
                rating: Number(review.rating),
                comment: review.comment,
                status: 'pending'
            };

            const response = await axios.post('http://localhost:5000/api/reviews', reviewData);
            alert(response.data.message || "Review submitted for Admin approval!");
            setReview({ rating: 5, comment: '' });
            setSelectedEvent(null);
        } catch (err) {
            console.error("Submission Error:", err.response?.data);
            const serverMsg = err.response?.data?.message || "Failed to submit review";
            alert(`Error: ${serverMsg}`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0d9488]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/user/dashboard')}
                            className="p-2 hover:bg-white/10 rounded-full transition-all border border-gray-700"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tighter uppercase">
                            <Ticket className="text-[#0d9488]" size={32} /> My Bookings
                        </h2>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => navigate('/reminders')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 bg-[#1e293b] hover:border-teal-500 transition-all shadow-lg">
                            <Bell size={16} className="text-teal-500" />
                            <span className="text-xs font-bold uppercase">Manage Reminders</span>
                        </button>

                        {['email', 'push'].map((type) => (
                            <button
                                key={type}
                                onClick={() => toggleSetting(type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                    settings[type] ? 'border-[#0d9488] bg-[#0d9488]/10' : 'border-gray-700 bg-[#1e293b]'
                                }`}
                            >
                                <Bell size={16} className={settings[type] ? 'text-[#0d9488]' : 'text-gray-500'} />
                                <span className="text-xs font-bold uppercase">{type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {reminders.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <h3 className="text-xs font-black text-gray-500 mb-4 tracking-widest uppercase">Upcoming Alerts</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reminders.map((rem, idx) => (
                                <div key={idx} className="bg-[#1e293b] p-4 rounded-2xl border-l-4 border-[#0d9488] flex items-center gap-4 shadow-lg">
                                    <div className="bg-[#0d9488]/20 p-2 rounded-full flex-shrink-0">
                                        <Clock className="text-[#0d9488]" size={20}/>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm truncate">{rem.eventName}</p>
                                        <p className="text-xs text-gray-400 font-medium">{rem.timeLabel}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-500 tracking-widest uppercase">Booking History</h3>
                    {bookings.length === 0 ? (
                        <div className="bg-[#1e293b]/50 p-20 rounded-3xl text-center border border-dashed border-gray-700">
                            <p className="text-gray-400 font-medium mb-4">No bookings found yet.</p>
                            <button onClick={() => navigate('/home')} className="text-[#0d9488] font-black uppercase text-sm tracking-tighter hover:underline">Start Exploring</button>
                        </div>
                    ) : (
                        bookings.map((booking) => {
                            const event = booking.showId?.event;
                            const show = booking.showId;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={booking._id}
                                    className="bg-[#1e293b] border border-gray-800 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:border-gray-600 transition-all shadow-2xl"
                                >
                                    <div className="w-full md:w-64 h-52 md:h-auto overflow-hidden bg-gray-900 flex-shrink-0">
                                        <img
                                            src={event?.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            alt="event"
                                        />
                                    </div>
                                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                                    {event?.name || "Unknown Event"}
                                                </h3>
                                                <div className="bg-teal-500/10 text-teal-500 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-teal-500/20">
                                                    Confirmed
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-400 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-[#0d9488]" />
                                                    {show?.date ? new Date(show.date).toLocaleDateString() : 'Date TBD'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-[#0d9488]" />
                                                    {show?.time || 'Time TBD'}
                                                </div>
                                                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                                                    <MapPin size={16} className="text-[#0d9488]" />
                                                    {show?.venue?.name || 'Venue not listed'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap items-center gap-4">
                                            <button
                                                onClick={() => navigate('/ticket', {
                                                    state: { ...booking, show: booking.showId, seats: booking.seats, _id: booking._id }
                                                })}
                                                className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
                                            >
                                                <ExternalLink size={16} /> View Ticket
                                            </button>
                                            <button
                                                onClick={() => setSelectedEvent(event?._id)}
                                                className="px-6 py-3 bg-[#111827] border border-gray-700 text-gray-300 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-gray-800 transition-all"
                                            >
                                                <MessageSquare size={16} /> Write Review
                                            </button>
                                            {canCancel(show?.date, show?.time) ? (
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    className="px-6 py-3 text-red-500 hover:bg-red-500/10 rounded-2xl font-black text-xs uppercase transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-gray-600 font-bold uppercase italic ml-auto">
                                                    Non-refundable
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                         <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1e293b] w-full max-w-md p-10 rounded-[40px] border border-gray-800 relative shadow-2xl"
                        >
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-8 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-[#0d9488]">Rate Show</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Share your experience</p>
                            </div>
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star} size={36}
                                        onClick={() => setReview({...review, rating: star})}
                                        className={`cursor-pointer transition-all ${review.rating >= star ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-700'}`}
                                    />
                                ))}
                            </div>
                            <textarea
                                className="w-full bg-[#0f172a] border border-gray-800 rounded-3xl p-5 text-sm mb-6 min-h-[120px] outline-none focus:border-[#0d9488] transition-all text-white"
                                placeholder="What did you think of the performance?"
                                value={review.comment}
                                onChange={(e) => setReview({...review, comment: e.target.value})}
                            />
                            <button onClick={handleReviewSubmit} className="w-full bg-[#0d9488] py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg active:scale-95 transition-all">
                                Submit Review
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;