import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Calendar, DollarSign, MapPin, TrendingUp, Wallet, Globe, Heart } from 'lucide-react';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
    const [user, setUser] = useState({});
    const [trips, setTrips] = useState([]);
    const [recommendedDestinations, setRecommendedDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedDestinations, setSavedDestinations] = useState([]);

    const [budgetStats, setBudgetStats] = useState({ totalBudget: 0, totalTrips: 0, avgBudget: 0 });
    const { t } = useLanguage();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch User Profile for Saved Destinations using endpoint
            const userRes = await api.get('/user/profile');
            setUser(userRes.data);
            setSavedDestinations(userRes.data.savedDestinations || []);

            // Fetch User Trips
            const tripsResponse = await api.get('/trips');
            const tripsData = tripsResponse.data;
            setTrips(tripsData);

            // Calculate Stats directly from real trip data
            const total = tripsData.reduce((acc, trip) => acc + (trip.budget || 0), 0);
            setBudgetStats({
                totalBudget: total,
                totalTrips: tripsData.length,
                avgBudget: tripsData.length ? Math.round(total / tripsData.length) : 0
            });

            // Fetch Real Recommendations from DB
            const recResponse = await api.get('/recommendations/destinations');
            setRecommendedDestinations(recResponse.data);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (destinationName) => {
        const isSaved = savedDestinations.includes(destinationName);

        // Optimistic Update
        let newSaved = [];
        if (isSaved) {
            newSaved = savedDestinations.filter(d => d !== destinationName);
        } else {
            newSaved = [...savedDestinations, destinationName];
        }
        setSavedDestinations(newSaved);

        try {
            if (isSaved) {
                await api.delete('/user/saved-destinations', { data: { destination: destinationName } });
            } else {
                await api.post('/user/saved-destinations', { destination: destinationName });
            }
        } catch (error) {
            console.error('Failed to toggle save:', error);
            // Revert on error
            setSavedDestinations(savedDestinations);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('welcome')}, {user.name || 'Traveler'} 👋
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">{t('plan')}</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        to="/search"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
                    >
                        <Search size={20} />
                        {t('explore')}
                    </Link>
                    <Link
                        to="/create-trip"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                        <PlusCircle size={20} />
                        {t('newTrip')}
                    </Link>
                </div>
            </div>

            {/* Budget Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="text-blue-100 text-sm font-medium">{t('totalBudget')}</span>
                    </div>
                    <h3 className="text-3xl font-bold">${budgetStats.totalBudget.toLocaleString()}</h3>
                    <p className="text-blue-100 text-sm mt-1">{t('acrossActiveTrips')}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Globe size={24} className="text-green-600" />
                        </div>
                        <span className="text-gray-500 text-sm font-medium">{t('totalTrips')}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{budgetStats.totalTrips}</h3>
                    <p className="text-green-600 text-sm mt-1 font-medium">{t('newRecently')}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <TrendingUp size={24} className="text-purple-600" />
                        </div>
                        <span className="text-gray-500 text-sm font-medium">{t('avgCost')}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">${budgetStats.avgBudget.toLocaleString()}</h3>
                    <p className="text-gray-400 text-sm mt-1">{t('perItinerary')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Trips Section (Takes up 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{t('recentTrips')}</h2>
                        <Link to="/my-trips" className="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                            {t('viewAll')}
                        </Link>
                    </div>

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-48 bg-gray-200 rounded-2xl"></div>
                            <div className="h-48 bg-gray-200 rounded-2xl"></div>
                        </div>
                    ) : trips.length > 0 ? (
                        <div className="space-y-4">
                            {trips.slice(0, 3).map((trip) => (
                                <div key={trip.id} className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
                                    <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                                        {trip.coverPhotoUrl ? (
                                            <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                <MapPin size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 py-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{trip.name}</h3>
                                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                                                {t('planned')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={16} />
                                                <span>{trip.startDate}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign size={16} />
                                                <span>${trip.budget}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Link to={`/trips/${trip.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                {t('manageItinerary')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">{t('noTrips')}</p>
                            <Link
                                to="/create-trip"
                                className="text-blue-600 font-medium hover:text-blue-700"
                            >
                                {t('startAdventure')} &rarr;
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recommended Destinations (Takes up 1 column) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">{t('recommended')}</h2>
                    {recommendedDestinations.length > 0 ? (
                        <div className="space-y-4">
                            {recommendedDestinations.map(dest => (
                                <div key={dest.id} className="relative group overflow-hidden rounded-2xl cursor-pointer">
                                    <div className="w-full h-40 bg-gray-200">
                                        <img
                                            src={dest.imageUrl || `https://loremflickr.com/800/600/${dest.name},travel/all`}
                                            alt={dest.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=500' }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                        <div className="flex justify-between items-end text-white">
                                            <div>
                                                <h4 className="font-bold text-lg">{dest.name}</h4>
                                                <span className="text-white/80 text-xs">{dest.country}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); toggleSave(dest.name); }}
                                                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${savedDestinations.includes(dest.name) ? 'bg-white/20 text-red-500' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                            >
                                                <Heart size={18} fill={savedDestinations.includes(dest.name) ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">{t('noRecommendations')}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
