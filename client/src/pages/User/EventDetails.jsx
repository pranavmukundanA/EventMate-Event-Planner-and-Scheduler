import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Star, MapPin, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showCityModal, setShowCityModal] = useState(false);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/events/${id}`);
                setEvent(response.data);
            } catch (err) {
                console.error("Error fetching event:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEventData();
    }, [id]);

    const cities = ["Chennai", "Coimbatore", "Trichy", "Madurai", "Pondicherry"];

    const canReview = (eventDate) => {
        const now = new Date();
        const show = new Date(eventDate);
        return now > show;
    };

    const handleCitySelect = (city) => {
        setShowCityModal(false);
        navigate('/booking/showtimes', { state: { eventId: id, city, eventName: event.name } });
    };

    if (loading) return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#0d9488]" size={48} />
        </div>
    );

    if (!event) return <div className="text-white text-center py-20">Event not found</div>;

    return (
        <div className="min-h-screen bg-[#111827] text-white pb-32">
            {/* HERO BANNER SECTION */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={event.poster} 
                    className="w-full h-full object-cover opacity-30" 
                    alt="background" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col md:flex-row items-end gap-8">
                    <motion.img 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        src={event.poster} 
                        className="w-48 h-72 rounded-2xl shadow-2xl border-2 border-gray-700 object-cover hidden md:block" 
                        alt="poster" 
                    />
                    <div className="flex-1">
                        <motion.h1 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-5xl md:text-7xl font-black mb-4 tracking-tighter"
                        >
                            {event.name}
                        </motion.h1>
                        <div className="flex flex-wrap items-center gap-4 text-gray-300">
                            <span className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-gray-700">
                                <Star size={18} className="text-[#F59E0B] mr-1" fill="#F59E0B" /> 
                                {event.averageRating || "0.0"}/5
                            </span>
                            <span className="flex items-center"><Clock size={18} className="mr-1 text-[#0d9488]" /> {event.duration}</span>
                            <span className="bg-[#0d9488]/20 text-[#0d9488] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#0d9488]/30">
                                {event.genre}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h3 className="text-2xl font-bold mb-4 flex items-center">
                            <div className="w-1 h-6 bg-[#0d9488] mr-3 rounded-full" />
                            About the Movie
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed font-light">
                            {event.description}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold mb-4 flex items-center">
                            <div className="w-1 h-6 bg-[#0d9488] mr-3 rounded-full" />
                            Top Cast
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {/* Fixed: Matches schema field 'cast' which is an array */}
                            {event.cast?.map((member, i) => (
                                <span key={i} className="bg-[#1f2937] border border-gray-800 px-6 py-3 rounded-2xl text-sm hover:border-[#0d9488] transition-colors cursor-default">
                                    {member}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="bg-[#1f2937] p-8 rounded-3xl border border-gray-800 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <MessageSquare className="mr-2 text-[#0d9488]" size={20} />
                            Reviews
                        </h3>
                        {canReview(event.createdAt) ? (
                            <div className="space-y-4">
                                <textarea 
                                    placeholder="Add your comment..." 
                                    className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 text-sm outline-none focus:border-[#0d9488]"
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1 text-[#F59E0B]">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} />)}
                                    </div>
                                    <button className="bg-[#0d9488] px-6 py-2 rounded-lg font-bold text-sm">Post</button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#111827] p-4 rounded-xl border border-dashed border-gray-700 text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Review Locked</p>
                                <p className="text-[10px] text-gray-600 mt-1">Available after the show concludes</p>
                            </div>
                        )}
                        <div className="mt-8 space-y-4">
                            {event.reviews?.map((c, i) => (
                                <div key={i} className="border-b border-gray-800 pb-4">
                                    <p className="font-bold text-sm text-[#0d9488]">{c.userEmail}</p>
                                    <p className="text-sm text-gray-400 mt-1 italic">"{c.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>

            {/* FIXED FOOTER */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#111827]/80 backdrop-blur-xl border-t border-gray-800 z-40 flex justify-center">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCityModal(true)}
                    className="w-full max-w-lg bg-[#0d9488] text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-teal-900/40 tracking-tight"
                >
                    Book Now
                </motion.button>
            </div>

            {/* CITY MODAL */}
            <AnimatePresence>
                {showCityModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                            onClick={() => setShowCityModal(false)} 
                        />
                        <motion.div 
                            initial={{ y: 100, opacity: 0, scale: 0.9 }} 
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 100, opacity: 0, scale: 0.9 }}
                            className="relative bg-[#1f2937] w-full max-w-md p-10 rounded-[40px] border border-gray-700 shadow-2xl"
                        >
                            <h2 className="text-3xl font-black mb-2 text-center">Where are you?</h2>
                            <p className="text-gray-500 text-center mb-8 text-sm uppercase tracking-widest">Select your city</p>
                            <div className="grid grid-cols-1 gap-3">
                                {cities.map(city => (
                                    <button 
                                        key={city}
                                        className="w-full p-5 rounded-2xl bg-[#111827] border border-gray-800 hover:border-[#0d9488] hover:bg-[#0d9488]/5 transition-all flex justify-between items-center group"
                                        onClick={() => handleCitySelect(city)}
                                    >
                                        <span className="font-bold text-lg">{city}</span>
                                        <ChevronRight size={20} className="text-gray-600 group-hover:text-[#0d9488]" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventDetails;