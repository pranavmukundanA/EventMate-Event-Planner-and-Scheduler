import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Styling
import './index.css';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

// User Pages
import UserHome from './pages/User/Home'; 
import MovieDetails from './pages/User/MovieDetails'; 
import SeatSelection from './pages/User/SeatSelection';
import UserDashboard from './pages/User/UserDashboard';
import MyBookings from './pages/User/MyBookings';
import Payment from './pages/User/Payment';
import Ticket from './pages/User/Ticket'; 
import Reminders from './pages/User/Reminders';

/**
 * A wrapper component that checks for an auth token.
 * We check localStorage directly to prevent state-sync redirects.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    // If these two exist, the user stays on the page. 
    // If they are missing, the user is sent to /login.
    if (!token || !userEmail) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public & Auth Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Shared/Public User Routes */}
                <Route path="/home" element={<UserHome />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/reminders" element={<Reminders />} />

                {/* Protected Booking Flow */}
                <Route path="/booking/:showId" element={
                    <ProtectedRoute>
                        <SeatSelection />
                    </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
    <ProtectedRoute>
        <AdminDashboard />
    </ProtectedRoute>
} />
                <Route path="/payment" element={
                    <ProtectedRoute>
                        <Payment />
                    </ProtectedRoute>
                } />
                <Route path="/ticket" element={
                    <ProtectedRoute>
                        <Ticket />
                    </ProtectedRoute>
                } />
                
                {/* Protected User Profile Routes */}
                <Route path="/user/dashboard" element={
                    <ProtectedRoute>
                        <UserDashboard />
                    </ProtectedRoute>
                } />
                
                {/* FIXED: Path name synchronized with your workflow and added Protection */}
                <Route path="/user/bookings" element={
                    <ProtectedRoute>
                        <MyBookings />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
                
            </Routes>
        </Router>
    );
}

export default App;