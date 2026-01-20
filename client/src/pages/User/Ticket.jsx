import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
    Download, ChevronLeft, MapPin, Calendar, 
    Clock, User, Share2, Home, CheckCircle2 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Ticket = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const ticketRef = useRef();

    // 1. Robust Data Extraction (Syncs with MyBookings and Payment)
    const data = location.state || {};
    const show = data.show || data.showId; 
    const seats = data.seats || data.selectedSeats || [];
    const totalAmount = data.totalAmount || data.totalPrice || 0;
    
    // Safety check for user identification
    const userEmail = data.userEmail || localStorage.getItem('userEmail');
    const bookingId = data._id || "PENDING";

    // Guard Clause: If data is missing, redirect to bookings history
    if (!show || seats.length === 0 || !show.event) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-xl mb-6 font-light text-gray-400 italic">
                        Ticket details could not be loaded.<br/>
                        Please access your ticket via <span className="text-[#0d9488] font-bold">My Bookings</span>.
                    </p>
                    <button 
                        onClick={() => navigate('/user/bookings')}
                        className="bg-[#0d9488] px-8 py-3 rounded-xl font-bold hover:bg-[#14b8a6] transition-all flex items-center gap-2 mx-auto"
                    >
                        <ChevronLeft size={18} /> Go to My Bookings
                    </button>
                </motion.div>
            </div>
        );
    }

    // 2. Action: Download PDF
    const downloadPDF = async () => {
        const element = ticketRef.current;
        const canvas = await html2canvas(element, { 
            scale: 3, 
            backgroundColor: '#0f172a',
            useCORS: true 
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`Ticket-${show.event.name}.pdf`);
    };

    // 3. Action: WhatsApp Share
    const shareToWhatsApp = () => {
        const message = `Hey! I just booked tickets for ${show.event.name} at ${show.venue?.name}. My seats: ${seats.join(', ')}. Transaction ID: ${bookingId}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-10 flex flex-col items-center pb-20">
            {/* Header Actions */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md flex justify-between items-center mb-10"
            >
                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                    <Home size={18}/> Home
                </button>
                <div className="flex gap-2">
                    <button onClick={shareToWhatsApp} className="p-3 bg-green-600/10 text-green-500 rounded-full hover:bg-green-600 hover:text-white transition-all">
                        <Share2 size={20} />
                    </button>
                    <button onClick={downloadPDF} className="p-3 bg-[#0d9488]/10 text-[#0d9488] rounded-full hover:bg-[#0d9488] hover:text-white transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </motion.div>

            {/* THE TICKET STUB */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                ref={ticketRef} 
                className="w-full max-w-md bg-[#1e293b] rounded-[45px] overflow-hidden shadow-2xl border border-gray-800 relative"
            >
                {/* Poster & Header */}
                <div className="h-56 relative">
                    <img src={show.event.poster} alt="poster" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/20 to-transparent" />
                    
                    <div className="absolute top-6 right-6 bg-[#0d9488] p-2 rounded-full text-white shadow-lg">
                        <CheckCircle2 size={24} />
                    </div>

                    <div className="absolute bottom-6 left-8 right-8">
                        <p className="text-[#0d9488] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Booking Confirmed</p>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{show.event.name}</h2>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                        <Detail icon={<Calendar size={14} className="text-[#0d9488]"/>} label="DATE" value={new Date(show.date).toLocaleDateString()} />
                        <Detail icon={<Clock size={14} className="text-[#0d9488]"/>} label="TIME" value={show.time} />
                        <Detail icon={<MapPin size={14} className="text-[#0d9488]"/>} label="VENUE" value={show.venue?.name} />
                        <Detail icon={<User size={14} className="text-[#0d9488]"/>} label="RESERVED BY" value={userEmail.split('@')[0].toUpperCase()} />
                    </div>

                    {/* Seat Display */}
                    <div className="bg-[#0f172a] p-6 rounded-[30px] border border-gray-800 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#0d9488]" />
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Selected Seats</p>
                        <p className="text-4xl font-black text-white tracking-widest">{seats.join(', ')}</p>
                    </div>

                    {/* QR & Total */}
                    <div className="pt-8 border-t border-dashed border-gray-700 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-[25px] shadow-2xl mb-4">
                            <QRCodeSVG 
                                value={`TICKET_ID_${bookingId}_${userEmail}`} 
                                size={130}
                                level="H"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ID: {bookingId.slice(-12)}</p>
                        <div className="mt-6 text-center">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Amount Paid</p>
                            <p className="text-2xl font-black text-[#0d9488]">₹{totalAmount}</p>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Ticket Notches */}
                <div className="absolute top-1/2 -left-5 w-10 h-10 bg-[#0f172a] rounded-full border-r border-gray-800" />
                <div className="absolute top-1/2 -right-5 w-10 h-10 bg-[#0f172a] rounded-full border-l border-gray-800" />
            </motion.div>

            {/* Footer Navigation */}
            <div className="mt-12">
                <button onClick={() => navigate('/user/bookings')}
                className="mt-6 w-full py-3 bg-[#1e293b] text-[#0d9488] font-bold rounded-xl border border-[#0d9488] hover:bg-[#0d9488] hover:text-white transition-all">
                    View Bookings
                </button>
            </div>
        </div>
    );
};

// Reusable Detail Component
const Detail = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1">
        <p className="text-[9px] text-gray-500 font-black tracking-widest flex items-center gap-1.5 opacity-80 uppercase">
            {icon} {label}
        </p>
        <p className="text-sm font-bold text-gray-200 truncate">{value || "N/A"}</p>
    </div>
);

export default Ticket;