import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Globe, Banknote, ChevronLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Destructure state with a safety fallback to empty object
    const { show, selectedSeats, totalPrice } = location.state || {};
    
    const [method, setMethod] = useState('direct');
    const [isBooking, setIsBooking] = useState(false); 

    const serviceFee = 30;
    const finalAmount = (totalPrice || 0) + serviceFee;

    // GUARD: If user refreshes or reaches here without state, redirect them
    if (!location.state || !show) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={64} className="text-red-500 mb-4" />
                return <div className="text-white p-10">Loading booking data...</div>;
                <p className="text-gray-400 mb-6">We couldn't find your booking details. Please restart the booking process.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="bg-[#0d9488] px-8 py-3 rounded-xl font-bold"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    const handleBooking = async () => {
    setIsBooking(true);
    try {
        // 1. Get the email that was saved during Login
        const email = localStorage.getItem('userEmail');

        // 2. Strict Check: If no email, force them to login instead of using 'guest'
        if (!email || email === "undefined" || email === "null") {
            alert("Session error: Please log in again to complete your booking.");
            navigate('/login');
            return;
        }

        const bookingData = {
            showId: show._id,
            seats: selectedSeats,
            userEmail: email.toLowerCase().trim(), // This is now the real user email
            totalAmount: finalAmount,
            serviceFee: serviceFee,
            basePrice: totalPrice
        };

        // 3. Send to backend
        const response = await axios.post('http://localhost:5000/api/bookings', bookingData);
        
        if (response.status === 201 || response.status === 200) {
            alert("Booking Confirmed!");
            navigate('/ticket', { 
                state: { 
                    ...response.data.booking,
                    show: show,
                    seats: selectedSeats,
                    totalAmount: finalAmount
                } 
            });
        }
    } catch (err) {
        console.error("Booking Error:", err);
        alert("Booking failed: " + (err.response?.data?.message || "Internal Server Error"));
    } finally {
        setIsBooking(false);
    }
};

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6">
            <header className="flex items-center gap-4 mb-8 max-w-4xl mx-auto">
                <ChevronLeft className="cursor-pointer hover:text-[#0d9488]" onClick={() => navigate(-1)} />
                <h1 className="text-2xl font-bold italic tracking-tighter uppercase">Checkout</h1>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Payment Methods */}
                <div className="space-y-4">
                    <h3 className="text-gray-500 uppercase text-xs font-black tracking-[0.2em]">Select Payment Method</h3>
                    
                    {[
                        { id: 'card', icon: <CreditCard />, label: 'Credit Card', disabled: true },
                        { id: 'paypal', icon: <Globe />, label: 'PayPal', disabled: true },
                        { id: 'gpay', icon: <Smartphone />, label: 'Google Pay', disabled: true },
                        { id: 'direct', icon: <Banknote />, label: 'Direct Payment', disabled: false },
                    ].map((mode) => (
                        <div 
                            key={mode.id}
                            onClick={() => !mode.disabled && setMethod(mode.id)}
                            className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                                method === mode.id ? 'border-[#0d9488] bg-[#0d9488]/10' : 'border-gray-800 bg-[#1e293b]'
                            } ${mode.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-600 cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={method === mode.id ? 'text-[#0d9488]' : 'text-gray-500'}>{mode.icon}</div>
                                <span className="font-bold">{mode.label}</span>
                            </div>
                            {mode.disabled && <span className="text-[10px] bg-gray-700 px-2 py-1 rounded font-black">SOON</span>}
                        </div>
                    ))}
                </div>

                {/* Right: Order Summary */}
                <div className="bg-[#1e293b] p-8 rounded-[32px] border border-gray-800 h-fit shadow-2xl">
                    <h3 className="text-xl font-black mb-6 italic tracking-tight uppercase">Order Summary</h3>
                    
                    <div className="mb-6 p-5 bg-[#0f172a] rounded-2xl border border-gray-800">
                        <p className="text-[#0d9488] font-black text-lg truncate uppercase">{show?.event?.name || "Movie Ticket"}</p>
                        <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wider">
                            {show?.venue?.name} • {show?.time}
                        </p>
                        <p className="text-gray-400 text-xs mt-2 italic">Seats: {selectedSeats?.join(", ")}</p>
                    </div>

                    <div className="space-y-4 border-b border-gray-800 pb-6">
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>Tickets ({selectedSeats?.length || 0})</span>
                            <span className="font-bold text-white">₹{totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>Service Fee</span>
                            <span className="font-bold text-white">₹{serviceFee}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-6">
                        <span className="font-black text-gray-500 text-xs tracking-widest uppercase">Total to Pay</span>
                        <span className="text-3xl font-black text-[#0d9488]">₹{finalAmount}</span>
                    </div>

                    <button 
                        onClick={handleBooking}
                        disabled={isBooking}
                        className="w-full bg-[#0d9488] py-4 rounded-2xl font-black text-lg hover:bg-[#14b8a6] transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3 uppercase tracking-tighter"
                    >
                        {isBooking ? (
                            <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Confirm & Pay"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;