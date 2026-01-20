import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { 
                email, 
                password 
            });
            
            if (response.data.token) {
                const { token, user } = response.data;

                // 1. Clear old messy data
                localStorage.clear(); 

                // 2. Set the token
                localStorage.setItem('token', token);

                // 3. SAFE STORAGE: Check if user object exists before saving
                // We save 'email' AND 'userEmail' to support all your other files
                const finalEmail = user?.email || email; 
                const finalName = user?.name || "User";
                const finalRole = user?.role || "user";

                localStorage.setItem('userEmail', finalEmail);
                localStorage.setItem('email', finalEmail);
                localStorage.setItem('userName', finalName);
                localStorage.setItem('role', finalRole);

                // 4. Navigate based on role
                if (finalRole === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/user/dashboard');
                }
            }
        } catch (err) {
            console.error("Login failed:", err);
            alert(err.response?.data?.message || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-[#1f2937] p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#0d9488] tracking-tight">Welcome Back</h2>
                    <p className="text-gray-400 mt-2">Sign in to manage your events</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-[#111827] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-[#0d9488] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full bg-[#111827] border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-[#0d9488] transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-[#0d9488] text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-900/20 hover:bg-[#14b8a6] transition-all"
                    >
                        Login
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400">
                        New here? <Link to="/register" className="text-[#0d9488] font-semibold hover:underline">Create an Account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;