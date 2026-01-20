import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Bell, Mail, Smartphone, Save } from 'lucide-react';

const Reminders = () => {
    const navigate = useNavigate();

    // State for notification toggles
    const [settings, setSettings] = useState({ email: true, push: false });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const userEmail = localStorage.getItem('userEmail') || "guest@example.com";

    // 1. Fetch upcoming alerts and existing preferences on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch upcoming reminders
                const remRes = await axios.get(`http://localhost:5000/api/bookings/reminders/${userEmail}`);
                setAlerts(remRes.data);

                // Fetch existing user notification settings
                const userRes = await axios.get(`http://localhost:5000/api/user/profile/${userEmail}`);
                if (userRes.data.notificationSettings) {
                    setSettings(userRes.data.notificationSettings);
                }
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userEmail]);

    // 2. Handle the UI toggle (Local state only)
    const handleToggle = (type) => {
        setSettings(prev => ({ ...prev, [type]: !prev[type] }));
    };

    // 3. Save Preferences to Database (Persistence Concern)
    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await axios.put('http://localhost:5000/api/user/update-notifications', {
                email: userEmail,
                notificationSettings: settings
            });
            alert("Notification preferences saved successfully!");
        } catch (err) {
            console.error("Failed to save settings");
            alert("Error saving preferences. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-gray-900 p-6">
            {/* Header */}
            <header className="flex items-center mb-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center font-bold text-xl tracking-tight">Event Reminders</h1>
            </header>

            {/* Upcoming Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-black mb-6 text-slate-800">Upcoming Event Reminders</h2>
                {alerts.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-400 italic">No events in the next 48 hours.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert, index) => (
                            <div key={index} className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-teal-500">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{alert.eventName}</h3>
                                    <p className="text-slate-400 text-sm font-medium">{alert.timeLabel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Notification Preferences Section */}
            <section className="mb-20">
                <h2 className="text-2xl font-black mb-6 text-slate-800">Notification Preferences</h2>
                <div className="space-y-4">
                    {/* Email Toggle */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="text-slate-400"><Mail size={22}/></div>
                            <span className="font-bold text-slate-700">Email Notifications</span>
                        </div>
                        <button 
                            onClick={() => handleToggle('email')}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${settings.email ? 'bg-teal-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${settings.email ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Push Toggle */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="text-slate-400"><Smartphone size={22}/></div>
                            <span className="font-bold text-slate-700">Push Notifications</span>
                        </div>
                        <button 
                            onClick={() => handleToggle('push')}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${settings.push ? 'bg-teal-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${settings.push ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl disabled:bg-gray-400"
                >
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                        <><Save size={20} /> Save Preferences</>
                    )}
                </button>
            </section>
        </div>
    );
};

export default Reminders;