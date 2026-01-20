import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Ticket, Star, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetching all available productions
                const res = await axios.get('http://localhost:5000/api/admin/events');
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Navbar */}
            <nav className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#0f172a]/90 backdrop-blur-md z-50">
                <div className="flex items-center space-x-8">
                    <h1 className="text-[#0d9488] text-2xl font-black tracking-tighter cursor-pointer uppercase italic" onClick={() => navigate('/')}>
                        EventMate
                    </h1>
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-[#0d9488]" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by movie or genre..." 
                            className="bg-[#1e293b] pl-10 pr-4 py-2 rounded-xl w-64 md:w-96 outline-none border border-transparent focus:border-[#0d9488] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <button onClick={() => navigate('/user/bookings')} className="flex items-center space-x-2 text-gray-300 hover:text-[#0d9488] transition-colors">
                        <Ticket size={20} />
                        <span className="font-bold text-sm uppercase">My Bookings</span>
                    </button>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <p className="text-[#0d9488] font-bold text-xs uppercase tracking-[0.2em] mb-2">Recommended</p>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Current Productions</h2>
                    </div>
                </div>
                
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
                        <p className="text-gray-500 text-lg italic">No live events matching your search...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {filteredEvents.map((event) => (
                            <motion.div 
                                key={event._id}
                                whileHover={{ y: -10 }}
                                className="cursor-pointer group"
                                onClick={() => navigate(`/movie/${event._id}`)}
                            >
                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group-hover:border-[#0d9488] transition-colors">
                                    <img 
                                        src={event.poster} 
                                        alt={event.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4 bg-[#0d9488] px-2 py-1 rounded flex items-center gap-1 text-white shadow-lg">
                                        <Star size={12} fill="currentColor" />
                                        <span className="text-[10px] font-black italic">NEW</span>
                                    </div>
                                </div>
                                <h3 className="mt-4 font-black uppercase italic tracking-tighter text-lg truncate group-hover:text-[#0d9488] transition-colors">{event.name}</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{event.genre}</p>
                                    <p className="text-gray-600 text-[10px]">{event.duration}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserDashboard;