import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Info, ChevronLeft, Heart } from 'lucide-react';

const ShowtimeSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Fallback data if state is missing mail
    const { city, eventName } = location.state || { city: 'Chennai', eventName: 'Event' };

    const [selectedDate, setSelectedDate] = useState(0);

    // Dynamic Date Generation (Next 5 days)
    const dates = [
        { day: 'TUE', date: '23', month: 'DEC' },
        { day: 'WED', date: '24', month: 'DEC' },
        { day: 'THU', date: '25', month: 'DEC' },
        { day: 'FRI', date: '26', month: 'DEC' },
        { day: 'SAT', date: '27', month: 'DEC' }
    ];

    // Mock Theater Data
    const theaters = [
        {
            id: 't1',
            name: 'PVR: Heritage, ECR',
            location: 'Uthandi, Chennai',
            amenities: ['M-Ticket', 'Food & Beverage'],
            shows: [
                { time: '10:30 AM', price: '₹190', type: '4K Dolby Atmos' },
                { time: '02:15 PM', price: '₹210', type: 'IMAX 2D' },
                { time: '06:45 PM', price: '₹250', type: 'IMAX 2D' },
                { time: '10:15 PM', price: '₹190', type: '4K Dolby Atmos' }
            ]
        },
        {
            id: 't2',
            name: 'SPI Cinemas: Palazzo',
            location: 'Vadapalani, Chennai',
            amenities: ['M-Ticket'],
            shows: [
                { time: '09:00 AM', price: '₹150', type: 'Dolby 7.1' },
                { time: '01:30 PM', price: '₹150', type: 'Dolby 7.1' },
                { time: '07:30 PM', price: '₹180', type: 'Dolby 7.1' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#111827] text-white">
            {/* 1. TOP NAVBAR */}
            <div className="bg-[#1f2937] p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="hover:text-[#0d9488]">
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold leading-tight">{eventName}</h1>
                        <p className="text-xs text-gray-400 flex items-center uppercase tracking-widest">
                            <MapPin size={12} className="mr-1 text-[#0d9488]" /> {city}
                        </p>
                    </div>
                </div>
                <Heart size={24} className="text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
            </div>

            {/* 2. HORIZONTAL DATE PICKER */}
            <div className="flex bg-[#111827] p-4 border-b border-gray-800 space-x-3 overflow-x-auto no-scrollbar shadow-inner">
                {dates.map((item, index) => (
                    <motion.button
                        key={index}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(index)}
                        className={`flex flex-col items-center min-w-[70px] py-2 rounded-2xl transition-all border ${
                            selectedDate === index 
                            ? 'bg-[#0d9488] border-[#0d9488] shadow-lg shadow-teal-900/30' 
                            : 'bg-[#1f2937] border-gray-800 text-gray-400'
                        }`}
                    >
                        <span className="text-[10px] font-bold">{item.day}</span>
                        <span className="text-lg font-black">{item.date}</span>
                        <span className="text-[10px]">{item.month}</span>
                    </motion.button>
                ))}
            </div>

            {/* 3. SHOWTIME LEGEND */}
            <div className="px-6 py-3 bg-[#111827] flex justify-end space-x-4 text-[10px] text-gray-500 border-b border-gray-800/50">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1" /> AVAILABLE</span>
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-400 mr-1" /> FAST FILLING</span>
            </div>

            {/* 4. THEATER LISTING */}
            <main className="p-4 space-y-4 pb-20">
                {theaters.map((theater) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={theater.id} 
                        className="bg-[#1f2937] rounded-3xl p-6 border border-gray-800 shadow-xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start">
                                <Heart size={16} className="mt-1 mr-3 text-gray-600" />
                                <div>
                                    <h3 className="font-bold text-lg text-white tracking-tight">{theater.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{theater.location}</p>
                                    <div className="flex gap-4 mt-3">
                                        {theater.amenities.map(a => (
                                            <span key={a} className="text-[9px] text-[#0d9488] flex items-center">
                                                <div className="w-1 h-1 bg-[#0d9488] rounded-full mr-1" /> {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Info size={18} className="text-gray-700" />
                        </div>

                        {/* SHOWTIME BUTTONS */}
                        <div className="flex flex-wrap gap-4">
                            {theater.shows.map((show, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05, borderColor: '#0d9488' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/booking/seats', { 
                                        state: { 
                                            theaterName: theater.name, 
                                            showTime: show.time, 
                                            eventName 
                                        } 
                                    })}
                                    className="relative group border border-gray-700 rounded-xl px-6 py-3 text-center transition-all bg-[#111827]/50"
                                >
                                    <p className="text-[#0d9488] font-black text-sm group-hover:text-white">{show.time}</p>
                                    <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold">{show.type}</p>
                                    
                                    {/* Tooltip on hover showing price */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0d9488] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {show.price}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </main>
        </div>
    );
};

export default ShowtimeSelection;