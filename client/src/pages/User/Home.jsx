import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Search, Sparkles } from 'lucide-react';

const UserHome = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/admin/events');
            setEvents(res.data);
            setFilteredEvents(res.data); // Initialize filtered list
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Search Logic
    useEffect(() => {
        const filtered = events.filter(movie => 
            movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEvents(filtered);
    }, [searchQuery, events]);

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0d9488]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* 1. Header & Search Section (Matching your screenshot) */}
            <div className="p-8 pb-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[#0d9488] font-black text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                            <Sparkles size={14}/> Recommended
                        </p>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Current <span className="text-gray-500">Productions</span>
                        </h1>
                    </div>

                    {/* Search Bar Implementation */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0d9488] transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by movie or genre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-800 py-4 pl-12 pr-6 rounded-2xl outline-none focus:border-[#0d9488] transition-all shadow-2xl placeholder:text-gray-600 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Events Grid */}
            <div className="p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredEvents.length === 0 ? (
                        <div className="col-span-full py-32 text-center bg-[#1e293b]/30 rounded-[40px] border border-dashed border-gray-800">
                            <div className="bg-[#1e293b] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <Search className="text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-400 font-bold italic text-lg">No live events matching your search...</p>
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="mt-4 text-[#0d9488] font-black uppercase text-xs tracking-widest hover:underline"
                            >
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        filteredEvents.map(movie => (
                            <div 
                                key={movie._id} 
                                className="group bg-[#1e293b] rounded-[32px] overflow-hidden border border-gray-800 hover:border-[#0d9488] transition-all cursor-pointer shadow-2xl relative"
                                onClick={() => navigate(`/movie/${movie._id}`)}
                            >
                                {/* Rating Badge (Optional Polish) */}
                                <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black text-yellow-500">
                                    ★ 4.8
                                </div>

                                <div className="relative h-96 overflow-hidden">
                                    <img 
                                        src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                                        alt={movie.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent opacity-60" />
                                    <div className="absolute inset-0 bg-[#0d9488]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white text-black p-5 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <Play fill="black" size={24}/>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-black truncate uppercase tracking-tighter mb-2">{movie.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase">
                                            <Clock size={12} className="text-[#0d9488]"/> {movie.duration}
                                        </div>
                                        <span className="bg-[#0d9488]/10 px-3 py-1 rounded-full text-[#0d9488] font-black text-[9px] uppercase tracking-widest">
                                            {movie.genre}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserHome;