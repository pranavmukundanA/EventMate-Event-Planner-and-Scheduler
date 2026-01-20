import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'user' 
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Removed 'const res =' because it wasn't being used
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert("Registration Successful! Please Login.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <motion.form 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleSubmit} 
                className="bg-[#1e293b] p-10 rounded-[40px] w-full max-w-md border border-gray-800 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-[#0d9488] italic tracking-tighter uppercase">Join Us</h2>
                    <p className="text-gray-500 text-sm mt-1">Create your account to get started</p>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Full Name</label>
                        <input 
                            type="text" placeholder="John Doe" required
                            className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white outline-none focus:border-[#0d9488] transition-all"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Email Address</label>
                        <input 
                            type="email" placeholder="name@company.com" required
                            className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white outline-none focus:border-[#0d9488] transition-all"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Password</label>
                        <input 
                            type="password" placeholder="••••••••" required
                            className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white outline-none focus:border-[#0d9488] transition-all"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Register As</label>
                        <select 
                            className="w-full bg-[#0f172a] border border-gray-700 p-4 rounded-2xl text-white outline-none focus:border-[#0d9488] appearance-none cursor-pointer"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="user">User (Book Tickets)</option>
                            <option value="admin">Admin (Manage Events)</option>
                        </select>
                    </div>
                </div>

                <button className="w-full bg-[#0d9488] py-4 rounded-2xl font-black text-white hover:bg-[#14b8a6] mt-8 transition-all shadow-lg active:scale-95 uppercase">
                    Create Account
                </button>
                
                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account? <span onClick={() => navigate('/login')} className="text-[#0d9488] font-bold cursor-pointer hover:underline">Login</span>
                </p>
            </motion.form>
        </div>
    );
};

export default Register;