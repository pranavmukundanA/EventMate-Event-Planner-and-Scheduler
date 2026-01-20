import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); // Clears token and userEmail
        window.location.href = '/login'; // Force refresh to reset App.js state
    };

    return (
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold transition-all"
        >
            <LogOut size={18} /> 
            <span>Logout</span>
        </button>
    );
};

export default LogoutButton;