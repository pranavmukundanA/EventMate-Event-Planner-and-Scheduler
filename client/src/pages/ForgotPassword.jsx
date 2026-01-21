import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // This hits your backend reset route
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage("Instructions sent! Check your email inbox.");
        } catch (err) {
            setMessage("Failed to send reset link. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1f2937] p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#0d9488] tracking-tight">Reset Password</h2>
                    <p className="text-gray-400 mt-2">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full bg-[#111827] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-[#0d9488] transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-[#0d9488] text-white py-3 rounded-xl font-bold hover:bg-[#14b8a6] transition-all"
                    >
                        Send Reset Link
                    </motion.button>
                </form>

                {message && <p className="mt-4 text-center text-sm text-[#0d9488] font-medium">{message}</p>}

                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white text-sm transition-colors">
                        ← Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;