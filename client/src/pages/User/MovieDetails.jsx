import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, MapPin, Calendar, ChevronRight, Star } from 'lucide-react';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [approvedReviews, setApprovedReviews] = useState([]);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                // 1. Fetch movie details
                const movieRes = await axios.get('http://localhost:5000/api/admin/events');
                const found = movieRes.data.find(m => m._id === id);
                setMovie(found);

                // 2. Fetch shows
                const showsRes = await axios.get(`http://localhost:5000/api/admin/shows/${id}`);
                setShows(showsRes.data);

                // 3. Fetch approved reviews to display
                const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/event/${id}`);
                setApprovedReviews(reviewsRes.data);
            } catch (err) {
                console.error("Error loading movie details", err);
            }
        };
        fetchMovieDetails();
    }, [id]);

    if (!movie) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic">Loading Movie Details...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Movie Header / Hero */}
            <div className="relative h-[450px] w-full border-b border-gray-800">
                <img src={movie.poster} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                
                <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center gap-10 px-8">
                    <img src={movie.poster} className="w-64 rounded-2xl shadow-2xl border border-gray-700 aspect-[2/3] object-cover" alt={movie.name} />
                    <div className="flex-1">
                        <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase">{movie.name}</h1>
                        <div className="flex items-center gap-4 mb-6 text-sm">
                            <span className="bg-[#0d9488] px-3 py-1 rounded text-white font-bold">{movie.genre}</span>
                            <span className="flex items-center gap-1 text-gray-400"><Clock size={16}/> {movie.duration}</span>
                            
                            <span className="flex items-center gap-1 text-yellow-500">
                                <Star size={16} fill="currentColor"/> 
                                {movie.averageRating || "0.0"}/5 
                                {/* Removed the hardcoded 0 reviews text */}
                                {movie.numReviews > 0 && ` (${movie.numReviews} reviews)`}
                            </span>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{movie.description}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 py-16 px-8">
                
                {/* LEFT: Showtime Selection */}
                <div className="md:col-span-2">
                    <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                        <Calendar className="text-[#0d9488]" /> Available Showtimes
                    </h2>

                    <div className="grid gap-4">
                        {shows.length > 0 ? shows.map(show => (
                            <div key={show._id} className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 flex justify-between items-center hover:border-[#0d9488] transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="border-r border-gray-700 pr-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                                        <p className="text-lg font-bold">{show.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 flex items-center gap-1 text-sm mb-1">
                                            <MapPin size={14}/> {show.venue?.name}
                                        </p>
                                        <p className="text-2xl font-black">{show.time}</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/booking/${show._id}`)} className="bg-[#0d9488] hover:bg-[#14b8a6] px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                                    Book <ChevronRight size={18} />
                                </button>
                            </div>
                        )) : <p className="text-gray-500 italic">No shows scheduled for this event yet.</p>}
                    </div>
                </div>

                {/* RIGHT: Display Reviews */}
                <div className="bg-[#1e293b] p-8 rounded-3xl border border-gray-800 h-fit">
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase italic tracking-tighter">
                        <Star className="text-yellow-500" fill="currentColor" /> Audience Buzz
                    </h3>

                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {approvedReviews.length > 0 ? approvedReviews.map(rev => (
                            <div key={rev._id} className="bg-[#0f172a]/50 p-4 rounded-2xl border border-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm text-[#0d9488]">{rev.userName}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed italic">"{rev.comment}"</p>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-gray-600 text-sm font-medium uppercase tracking-widest">No reviews yet</p>
                                <p className="text-gray-700 text-[10px] mt-2 font-bold">STAY TUNED FOR THE BUZZ!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;