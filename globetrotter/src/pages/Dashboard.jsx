import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Calendar, DollarSign, MapPin } from 'lucide-react';
import api from '../lib/axios';

const Dashboard = () => {
    const [user, setUser] = useState({});
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips');
            setTrips(response.data);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user.name || 'Traveler'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Ready to plan your next adventure?</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/search"
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Search size={20} />
                        Explore
                    </Link>
                    <Link
                        to="/create-trip"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <PlusCircle size={20} />
                        Plan New Trip
                    </Link>
                </div>
            </div>

            {/* Stats/Quick View (Optional - could go here) */}

            {/* Recent Trips Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your Trips</h2>
                    <Link to="/my-trips" className="text-blue-600 font-medium hover:text-blue-700">
                        View All
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {trip.coverPhotoUrl ? (
                                        <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                                            <MapPin size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                                        {/* Calculate duration or status */}
                                        Draft
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{trip.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>{trip.startDate} - {trip.endDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span>Budget: ${trip.budget}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                                        <Link
                                            to={`/trips/${trip.id}`}
                                            className="text-blue-600 font-medium hover:text-blue-700 text-sm"
                                        >
                                            View Itinerary →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No trips planned yet</h3>
                        <p className="text-gray-500 mb-6">Start by creating your first personalized itinerary.</p>
                        <Link
                            to="/create-trip"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <PlusCircle size={20} />
                            Create First Trip
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
