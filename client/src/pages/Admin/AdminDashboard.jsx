import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, MapPin, Calendar, PlusCircle, 
    LogOut, X, Clock, IndianRupee, Trash2, Edit2, Ticket, Search, Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewModeration from './ReviewModeration'; 

const cardStyle = "bg-[#1f2937]/50 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl";
const inputStyle = "w-full bg-[#111827] border border-gray-700 p-3 rounded-xl outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-all text-white";

// CONSISTENT HELPER: Use the same key across the whole app
const getAdminEmail = () => localStorage.getItem('userEmail');
const getAdminName = () => (getAdminEmail()?.split('@')[0] || "ADMIN").toUpperCase();

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button 
        onClick={() => onClick(label)}
        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${active === label ? 'bg-[#0d9488] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const adminEmail = getAdminEmail();

    useEffect(() => {
    const fetchBookings = async () => {
        try {
            const adminEmail = localStorage.getItem('userEmail');
            // ENSURE THIS URL MATCHES
            const res = await axios.get(`http://localhost:5000/api/admin/bookings?adminEmail=${adminEmail}`);
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
    };
    fetchBookings();
    }, []);

    const filtered = bookings.filter(b => 
        b.userEmail?.toLowerCase().includes(search.toLowerCase()) || 
        b.showId?.event?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your movie or customer..." 
                        className={`${inputStyle} pl-10`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="bg-[#0d9488]/10 border border-[#0d9488]/20 px-6 py-3 rounded-2xl">
                    <p className="text-xs text-[#0d9488] font-bold uppercase">My Sales</p>
                    <p className="text-xl font-black">{filtered.length} Bookings</p>
                </div>
            </div>

            <div className="bg-[#1f2937] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-[#111827] text-gray-400 text-xs uppercase font-black">
                        <tr>
                            <th className="p-5">Event</th>
                            <th className="p-5">Customer</th>
                            <th className="p-5">Seats</th>
                            <th className="p-5 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filtered.length > 0 ? filtered.map((b) => (
                            <tr key={b._id} className="hover:bg-gray-800/30">
                                <td className="p-5 flex items-center gap-3">
                                    <img src={b.showId?.event?.poster} className="w-10 h-14 object-cover rounded shadow-md" alt="" />
                                    <div>
                                        <p className="font-bold">{b.showId?.event?.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{b.showId?.time}</p>
                                    </div>
                                </td>
                                <td className="p-5 text-sm text-gray-400">{b.userEmail}</td>
                                <td className="p-5">
                                    <span className="bg-[#0d9488]/10 text-[#0d9488] px-3 py-1 rounded-full text-xs font-bold">
                                        {b.seats?.join(', ')}
                                    </span>
                                </td>
                                <td className="p-5 text-right font-black text-emerald-400">₹{b.totalAmount}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-500 uppercase font-bold">No Data Found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OverviewCards = () => {
    const [stats, setStats] = useState({ events: 0, venues: 0, revenue: 0 });
    const adminEmail = getAdminEmail();

    useEffect(() => {
    const fetchStats = async () => {
        try {
            const adminEmail = localStorage.getItem('userEmail'); // Get it here
            
            const [e, v, b] = await Promise.all([
                axios.get(`http://localhost:5000/api/admin/events?adminEmail=${adminEmail}`),
                axios.get(`http://localhost:5000/api/admin/venues?adminEmail=${adminEmail}`),
                axios.get(`http://localhost:5000/api/admin/bookings?adminEmail=${adminEmail}`)
            ]);
                
                const bookingsData = Array.isArray(b.data) ? b.data : [];
                const totalRev = bookingsData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
                
                setStats({ 
                    events: Array.isArray(e.data) ? e.data.length : 0, 
                    venues: Array.isArray(v.data) ? v.data.length : 0, 
                    revenue: totalRev 
                });
            } catch (err) { console.error(err); }
        };
        if(adminEmail) fetchStats();
    }, [adminEmail]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="p-6 rounded-3xl bg-gradient-to-br from-[#0d9488] to-emerald-800 shadow-xl">
                <p className="opacity-80 font-bold uppercase text-[10px] tracking-widest text-white">Your Gross Revenue</p>
                <h3 className="text-4xl font-black mt-2 flex items-center gap-2 text-white"><IndianRupee size={28}/> {stats.revenue.toLocaleString()}</h3>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="p-6 rounded-3xl bg-[#1f2937] border border-gray-700">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your Productions</p>
                <h3 className="text-4xl font-black mt-2 text-white">{stats.events}</h3>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="p-6 rounded-3xl bg-[#1f2937] border border-gray-700">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your Venues</p>
                <h3 className="text-4xl font-black mt-2 text-white">{stats.venues}</h3>
            </motion.div>
        </div>
    );
};

const ManageVenue = () => {
    const adminEmail = getAdminEmail();
    const [venues, setVenues] = useState([]);
    const [venueData, setVenueData] = useState({ name: '', city: '', address: '', rows: 10, cols: 12 });

    const fetchVenues = useCallback(async () => {
    try {
        const adminEmail = getAdminEmail(); // Use the helper
        const res = await axios.get(`http://localhost:5000/api/admin/venues?adminEmail=${adminEmail}`);
        setVenues(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
        console.error("Venue Fetch Error:", err); 
    }
    }, []);
    useEffect(() => { fetchVenues(); }, [fetchVenues]);

    const handleSaveVenue = async () => {
        try {
            if (!venueData.name || !venueData.city) return alert("Fill Name and City");
            await axios.post('http://localhost:5000/api/admin/create-venue', { ...venueData, adminEmail });
            alert("✅ Venue Saved!");
            fetchVenues(); 
        } catch (err) { alert("Error saving venue"); }
    };

    return (
        <div className="space-y-8">
            <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold mb-6 italic uppercase">Create New Venue</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input type="text" placeholder="Venue Name" onChange={(e) => setVenueData({...venueData, name: e.target.value})} className={inputStyle} />
                    <input type="text" placeholder="City" onChange={(e) => setVenueData({...venueData, city: e.target.value})} className={inputStyle} />
                    <input type="text" placeholder="Address" onChange={(e) => setVenueData({...venueData, address: e.target.value})} className={inputStyle} />
                </div>
                <div className="flex items-center gap-6 mb-8 p-4 bg-[#111827] rounded-xl border border-gray-800">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rows</label>
                        <input type="number" value={venueData.rows} onChange={(e) => setVenueData({...venueData, rows: parseInt(e.target.value)})} className="bg-[#1f2937] border border-gray-700 p-2 rounded-lg w-24 text-white" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Cols</label>
                        <input type="number" value={venueData.cols} onChange={(e) => setVenueData({...venueData, cols: parseInt(e.target.value)})} className="bg-[#1f2937] border border-gray-700 p-2 rounded-lg w-24 text-white" />
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-[#0d9488] font-black text-xl">{venueData.rows * venueData.cols}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Total Seats</p>
                    </div>
                </div>
                <button onClick={handleSaveVenue} className="bg-[#0d9488] px-8 py-3 rounded-xl font-bold hover:bg-[#14b8a6]">Save Venue</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venues.map(v => (
                    <div key={v._id} className="bg-[#1f2937]/50 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                        <div><p className="font-bold">{v.name}</p><p className="text-xs text-gray-500">{v.rows}x{v.cols} Matrix</p></div>
                        <div className="bg-[#0d9488]/10 text-[#0d9488] px-3 py-1 rounded-lg text-xs font-bold">{v.rows * v.cols} Seats</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CreateEvent = ({ editMode = false, existingData = null, onComplete }) => {
    const adminEmail = getAdminEmail();
    const [posterBase64, setPosterBase64] = useState(existingData?.poster || '');
    const [availableVenues, setAvailableVenues] = useState([]);
    
    // Fixed state keys to match payload logic
    const [eventData, setEventData] = useState(existingData || {
        name: '', 
        duration: '', 
        description: '', 
        genre: '', 
        cast: '', 
        languages: '', // Matches the payload key below
        activeVenues: []
    });

    useEffect(() => {
        axios.get(`http://localhost:5000/api/admin/venues?adminEmail=${adminEmail}`)
            .then(res => setAvailableVenues(res.data));
    }, [adminEmail]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => setPosterBase64(reader.result);
        if(file) reader.readAsDataURL(file);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        
        const adminMail = localStorage.getItem('userEmail');
        const adminName = localStorage.getItem('userName') || "Admin";

        // DATA CLEANING: Convert strings to arrays for Mongoose
        const castArray = typeof eventData.cast === 'string' 
            ? eventData.cast.split(',').map(item => item.trim()).filter(Boolean) 
            : eventData.cast;

        const langArray = typeof eventData.languages === 'string' 
            ? eventData.languages.split(',').map(item => item.trim()).filter(Boolean) 
            : eventData.languages;

        const payload = {
            name: eventData.name,
            description: eventData.description,
            poster: posterBase64,
            duration: eventData.duration,
            genre: eventData.genre,
            cast: castArray, 
            languages: langArray, 
            activeVenues: eventData.activeVenues,
            adminOwner: adminName, 
            adminEmail: adminMail
        };

        try {
            const url = editMode 
                ? `http://localhost:5000/api/admin/events/${existingData._id}`
                : 'http://localhost:5000/api/admin/events';
                
            const method = editMode ? 'put' : 'post';
            
            await axios[method](url, payload);
            alert("✅ Success!");
            onComplete();
        } catch (err) {
            const serverError = err.response?.data?.message || "Unknown Error";
            alert("🚨 SERVER ERROR: " + serverError);
            console.error("Full Error:", err.response?.data);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1f2937] p-8 rounded-2xl border border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="w-full h-96 bg-[#111827] border-2 border-dashed border-gray-600 rounded-2xl flex justify-center items-center relative overflow-hidden">
                        {posterBase64 ? <img src={posterBase64} className="w-full h-full object-cover" alt="poster" /> : <div className="text-center text-gray-500"><PlusCircle className="mx-auto mb-2" size={40} /><p>Upload Poster</p></div>}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <input type="text" value={eventData.name} placeholder="Event Name" onChange={(e)=>setEventData({...eventData, name: e.target.value})} className={inputStyle} />
                    <textarea value={eventData.description} placeholder="Description" rows="2" onChange={(e)=>setEventData({...eventData, description: e.target.value})} className={inputStyle}></textarea>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={eventData.cast} placeholder="Cast (e.g. Actor Name, Director)" onChange={(e)=>setEventData({...eventData, cast: e.target.value})} className={inputStyle} />
                        <input type="text" value={eventData.languages} placeholder="Language (e.g. English, Hindi)" onChange={(e)=>setEventData({...eventData, languages: e.target.value})} className={inputStyle} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={eventData.genre} placeholder="Genre" onChange={(e)=>setEventData({...eventData, genre: e.target.value})} className={inputStyle} />
                        <input type="text" value={eventData.duration} placeholder="Duration (e.g. 2h 30m)" onChange={(e)=>setEventData({...eventData, duration: e.target.value})} className={inputStyle} />
                    </div>
                    
                    <p className="text-xs text-gray-400 font-bold uppercase">Select Your Venues</p>
                    <div className="flex flex-wrap gap-2">
                        {availableVenues.map(v => (
                            <button key={v._id} type="button" onClick={() => setEventData(p => ({...p, activeVenues: p.activeVenues.includes(v._id) ? p.activeVenues.filter(id => id !== v._id) : [...p.activeVenues, v._id]}))}
                                className={`px-4 py-2 rounded-full text-xs border ${eventData.activeVenues.includes(v._id) ? 'bg-[#0d9488] border-[#0d9488]' : 'border-gray-600 text-gray-400'}`}>
                                {v.name}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleCreateEvent} className="w-full bg-[#0d9488] py-4 rounded-xl font-bold hover:bg-[#14b8a6]">
                        {editMode ? "Update Changes" : "Create Production"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ScheduledEvents = ({ onEdit }) => {
    const adminEmail = getAdminEmail();
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [venues, setVenues] = useState([]);
    const [showData, setShowData] = useState({ venueId: '', date: '', time: '', prices: { gold: '', silver: '', bronze: '' } });

    const fetchEvents = useCallback(async () => {
        try {
        // GET THE EMAIL RIGHT BEFORE THE CALL
        const adminEmail = localStorage.getItem('userEmail');
        
        // UPDATE THIS LINE:
        const evRes = await axios.get(`http://localhost:5000/api/admin/events?adminEmail=${adminEmail}`);
        
        const venRes = await axios.get(`http://localhost:5000/api/admin/venues?adminEmail=${adminEmail}`);
        
        setEvents(Array.isArray(evRes.data) ? evRes.data : []);
        setVenues(Array.isArray(venRes.data) ? venRes.data : []);
    } catch (err) { 
        console.error("Fetch Error:", err); 
    }
    }, []);

    useEffect(() => { if(adminEmail) fetchEvents(); }, [fetchEvents, adminEmail]);

    const handleDelete = async (id) => {
        if(window.confirm("Delete this event?")) {
            await axios.delete(`http://localhost:5000/api/admin/events/${id}`);
            fetchEvents();
        }
    };

    const handleAddShow = async () => {
        try {
            await axios.post('http://localhost:5000/api/admin/create-show', { ...showData, eventId: selectedEvent._id, adminEmail });
            alert("✨ Showtime Scheduled!");
            setShowModal(false);
        } catch (err) { alert("Failed to schedule show"); }
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            {events.length > 0 ? events.map(event => (
                <motion.div key={event._id} className={`${cardStyle} p-5 flex flex-col md:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center space-x-6">
                        <img src={event.poster} className="w-16 h-24 object-cover rounded-lg" alt="" />
                        <div><h3 className="text-xl font-bold italic uppercase tracking-tighter">{event.name}</h3><p className="text-gray-500 text-xs">{event.genre} | {event.duration}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(event)} className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-xl"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(event._id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={18}/></button>
                        <button onClick={() => { setSelectedEvent(event); setShowModal(true); }} className="bg-[#0d9488] px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 uppercase"><Clock size={16} /> Schedule</button>
                    </div>
                </motion.div>
            )) : <p className="text-center p-10 text-gray-500">No events created yet.</p>}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${cardStyle} w-full max-w-2xl p-8 bg-[#1f2937] relative`}>
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-6 text-gray-400"><X size={28}/></button>
                            <h2 className="text-2xl font-black italic uppercase mb-6 text-[#0d9488]">Add Show: {selectedEvent?.name}</h2>
                            <div className="space-y-6">
                                <select onChange={(e) => setShowData({...showData, venueId: e.target.value})} className={inputStyle}>
                                    <option value="">Choose Venue...</option>
                                    {venues.map(v => <option key={v._id} value={v._id}>{v.name} ({v.city})</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="date" onChange={(e)=>setShowData({...showData, date: e.target.value})} className={inputStyle} />
                                    <input type="time" onChange={(e)=>setShowData({...showData, time: e.target.value})} className={inputStyle} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="number" placeholder="Gold" onChange={(e)=>setShowData({...showData, prices: {...showData.prices, gold: e.target.value}})} className={inputStyle} />
                                    <input type="number" placeholder="Silver" onChange={(e)=>setShowData({...showData, prices: {...showData.prices, silver: e.target.value}})} className={inputStyle} />
                                    <input type="number" placeholder="Bronze" onChange={(e)=>setShowData({...showData, prices: {...showData.prices, bronze: e.target.value}})} className={inputStyle} />
                                </div>
                                <button onClick={handleAddShow} className="w-full bg-[#0d9488] py-4 rounded-xl font-black uppercase">Confirm Schedule</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [editEventData, setEditEventData] = useState(null);

    // Get admin email from localStorage to pass to the moderation component
    const adminEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') navigate('/login');
    }, [navigate]);

    return (
        <div className="flex min-h-screen bg-[#111827] text-white">
            <aside className="w-64 bg-[#1f2937] border-r border-gray-800 flex flex-col p-6 h-screen sticky top-0">
                <h1 className="text-[#0d9488] text-2xl font-black mb-10 text-center italic tracking-tighter uppercase">EventMate</h1>
                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeTab} onClick={setActiveTab} />
                    <SidebarItem icon={<Calendar size={20}/>} label="Scheduled Events" active={activeTab} onClick={setActiveTab} />
                    <SidebarItem icon={<Ticket size={20}/>} label="Bookings" active={activeTab} onClick={setActiveTab} />
                    
                    {/* ADDED: Reviews Sidebar Item */}
                    <SidebarItem icon={<Star size={20}/>} label="Reviews" active={activeTab} onClick={setActiveTab} />
                    
                    <SidebarItem icon={<MapPin size={20}/>} label="Manage Venue" active={activeTab} onClick={setActiveTab} />
                    <SidebarItem icon={<PlusCircle size={20}/>} label="Create Event" active={activeTab} onClick={(tab) => { setEditEventData(null); setActiveTab(tab); }} />
                </nav>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center space-x-3 text-red-400 p-2 mt-auto font-bold"><LogOut size={20} /><span>Logout</span></button>
            </aside>

            <main className="flex-1 p-8">
                <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        {editEventData ? "Edit Production" : activeTab}
                    </h2>
                    
                    <div className="flex items-center gap-4 bg-[#1f2937] px-5 py-2.5 rounded-2xl border border-gray-700">
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-[#0d9488] font-black uppercase tracking-widest">Authorized Admin</span>
                            <span className="text-sm font-bold text-gray-200">{getAdminName()}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#0d9488] flex items-center justify-center">
                            <LayoutDashboard size={20} className="text-white" />
                        </div>
                    </div>
                </header>
                
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {activeTab === 'Overview' && <OverviewCards />}
                    {activeTab === 'Bookings' && <AdminBookings />}
                    
                    {/* ADDED: Review Moderation Component */}
                    {activeTab === 'Reviews' && <ReviewModeration adminEmail={adminEmail} />}
                    
                    {activeTab === 'Manage Venue' && <ManageVenue />}
                    {activeTab === 'Create Event' && (
                        <CreateEvent 
                            editMode={!!editEventData} 
                            existingData={editEventData} 
                            onComplete={() => { setEditEventData(null); setActiveTab('Scheduled Events'); }} 
                        />
                    )}
                    {activeTab === 'Scheduled Events' && <ScheduledEvents onEdit={(ev) => { setEditEventData(ev); setActiveTab('Create Event'); }} />}
                </motion.div>
            </main>
        </div>
    );
};
export default AdminDashboard;