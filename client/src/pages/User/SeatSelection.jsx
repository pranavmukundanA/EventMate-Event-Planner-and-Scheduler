import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Remove 'Info' from this line mail
import { Armchair, ChevronLeft, AlertCircle } from 'lucide-react';

const SeatSelection = () => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        // Updated endpoint to match your backend structure
        axios.get(`http://localhost:5000/api/admin/show-details/${showId}`)
            .then(res => setShow(res.data))
            .catch(err => console.error("Error fetching show layout:", err));
    }, [showId]);

    const getSeatPrice = (seatId) => {
        const rowChar = seatId.charAt(0);
        const totalRows = show.venue.rows;
        const rowIndex = rowChar.charCodeAt(0) - 65; 

        // Split Logic: Top 20% Gold, Middle 50% Silver, Bottom 30% Bronze
        if (rowIndex < totalRows * 0.2) return Number(show.prices.gold);
        if (rowIndex < totalRows * 0.7) return Number(show.prices.silver);
        return Number(show.prices.bronze);
    };

    const getSeatCategory = (seatId) => {
        const rowChar = seatId.charAt(0);
        const totalRows = show.venue.rows;
        const rowIndex = rowChar.charCodeAt(0) - 65; 
        if (rowIndex < totalRows * 0.2) return "Gold";
        if (rowIndex < totalRows * 0.7) return "Silver";
        return "Bronze";
    };

    const calculateTotal = () => {
        return selectedSeats.reduce((sum, seatId) => sum + getSeatPrice(seatId), 0);
    };

    const toggleSeat = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleBooking = () => {
    const ticketPrice = calculateTotal();
    
    // 1. Get the email from storage (Ensure you used 'userEmail' in Login.jsx)
    const email = localStorage.getItem('userEmail');

    // 2. Pass it into the state so the Payment page can receive it
    navigate('/payment', { 
        state: { 
            show, 
            selectedSeats, 
            totalPrice: ticketPrice,
            userEmail: email // THIS IS THE MISSING LINK
        } 
    });
    };

    if (!show) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="animate-pulse text-[#0d9488] font-black italic tracking-widest uppercase">Initializing Layout...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8 pb-32">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-8 hover:text-white transition-all group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> Back to Movie
            </button>

            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{show.event.name}</h1>
                <p className="text-[#0d9488] mb-12 uppercase tracking-[0.3em] text-[10px] font-bold">
                    {show.venue.name} • {show.venue.city} • {show.time}
                </p>

                {/* Legend */}
                <div className="flex justify-center gap-6 mb-12 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-gray-500"><div className="w-3 h-3 bg-[#1e293b] rounded-sm"></div> Available</div>
                    <div className="flex items-center gap-2 text-gray-700"><div className="w-3 h-3 bg-gray-800 opacity-20 rounded-sm"></div> Sold</div>
                    <div className="flex items-center gap-2 text-[#0d9488]"><div className="w-3 h-3 bg-[#0d9488] rounded-sm"></div> Selected</div>
                </div>

                {/* Screen UI */}
                <div className="relative mb-24 max-w-2xl mx-auto">
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-[#0d9488] to-transparent rounded-full shadow-[0_15px_50px_rgba(13,148,136,0.6)]"></div>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-black uppercase tracking-[0.5em]">Stage / Screen</span>
                </div>

                {/* Seat Grid */}
                <div className="inline-block bg-[#111827]/50 p-10 rounded-[3rem] border border-gray-800/50 shadow-inner">
                    <div className="flex flex-col items-center gap-3 overflow-x-auto scrollbar-hide">
                        {Array.from({ length: show.venue.rows }).map((_, rowIndex) => (
                            <div key={rowIndex} className="flex items-center gap-3">
                                <div className="w-6 text-[10px] text-gray-600 font-black uppercase">{String.fromCharCode(65 + rowIndex)}</div>
                                {Array.from({ length: show.venue.cols }).map((_, colIndex) => {
                                    const seatId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
                                    const isSelected = selectedSeats.includes(seatId);
                                    const isBooked = show.bookedSeats?.includes(seatId);
                                    const category = getSeatCategory(seatId);

                                    return (
                                        <button
                                            key={seatId}
                                            disabled={isBooked}
                                            onClick={() => toggleSeat(seatId)}
                                            title={`${seatId} (${category} - ₹${getSeatPrice(seatId)})`}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                                                ${isBooked ? 'bg-gray-800/30 cursor-not-allowed opacity-10' : 
                                                  isSelected ? 'bg-[#0d9488] scale-110 shadow-[0_0_20px_rgba(13,148,136,0.4)]' : 
                                                  'bg-[#1e293b] hover:bg-[#334155] border border-gray-800 hover:border-[#0d9488]/50'}`}
                                        >
                                            <Armchair size={16} className={isSelected ? 'text-white' : isBooked ? 'text-gray-900' : 'text-gray-600'} />
                                        </button>
                                    );
                                })}
                                <div className="w-6 text-[10px] text-gray-600 font-black uppercase">{String.fromCharCode(65 + rowIndex)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/80 backdrop-blur-2xl p-8 border-t border-gray-800/50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-50">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div className="flex gap-10">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Seats</span>
                                <span className="text-white font-black italic text-lg">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '---'}</span>
                            </div>
                            <div className="flex flex-col border-l border-gray-800 pl-10">
                                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Price Per Ticket</span>
                                <span className="text-white font-bold text-sm">
                                    {selectedSeats.length > 0 ? `₹${getSeatPrice(selectedSeats[0])}` : '₹0'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">Grand Total</span>
                                <span className="text-4xl font-black text-[#0d9488] italic tracking-tighter">₹{calculateTotal()}</span>
                            </div>
                            <button 
                                disabled={selectedSeats.length === 0}
                                onClick={handleBooking}
                                className="bg-[#0d9488] hover:bg-[#14b8a6] disabled:bg-gray-800/50 disabled:text-gray-600 px-16 py-5 rounded-2xl font-black italic tracking-tighter text-xl transition-all shadow-[0_10px_30px_rgba(13,148,136,0.3)] active:scale-95 uppercase"
                            >
                                Secure Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;