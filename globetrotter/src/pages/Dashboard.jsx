import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    MdAddCircle, 
    MdSearch, 
    MdDateRange, 
    MdAttachMoney, 
    MdPlace, 
    MdTrendingUp, 
    MdAccountBalanceWallet,
    MdPublic,
    MdFavorite,
    MdFavoriteBorder
} from 'react-icons/md';
import { FaPlane, FaChartLine } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import toast from 'react-hot-toast';
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
            const userRes = await api.get('/user/profile');
            setUser(userRes.data);
            setSavedDestinations(userRes.data.savedDestinations || []);

            const tripsResponse = await api.get('/trips');
            const tripsData = tripsResponse.data;
            setTrips(tripsData);

            const total = tripsData.reduce((acc, trip) => acc + (trip.budget || 0), 0);
            setBudgetStats({
                totalBudget: total,
                totalTrips: tripsData.length,
                avgBudget: tripsData.length ? Math.round(total / tripsData.length) : 0
            });

            const recResponse = await api.get('/recommendations/destinations');
            setRecommendedDestinations(recResponse.data);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (destinationName) => {
        const isSaved = savedDestinations.includes(destinationName);
        const newSaved = isSaved 
            ? savedDestinations.filter(d => d !== destinationName)
            : [...savedDestinations, destinationName];
        
        setSavedDestinations(newSaved);

        try {
            if (isSaved) {
                await api.delete('/user/saved-destinations', { data: { destination: destinationName } });
                toast.success('Removed from favorites');
            } else {
                await api.post('/user/saved-destinations', { destination: destinationName });
                toast.success('Added to favorites! ❤️');
            }
        } catch (error) {
            console.error('Failed to toggle save:', error);
            setSavedDestinations(savedDestinations);
            toast.error('Failed to update favorites');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                        {t('welcome')}, {user.name || 'Traveler'} 👋
                    </h1>
                    <p className="text-gray-600 text-lg">{t('plan')}</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/search"
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all font-semibold group"
                    >
                        <MdSearch className="text-xl group-hover:scale-110 transition-transform" />
                        {t('explore')}
                    </Link>
                    <Link
                        to="/create-trip"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold transform hover:-translate-y-0.5"
                    >
                        <MdAddCircle className="text-xl" />
                        {t('newTrip')}
                    </Link>
                </div>
            </div>

            {/* Budget Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Total Budget Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <MdAccountBalanceWallet className="text-3xl" />
                            </div>
                            <span className="text-blue-100 text-sm font-semibold">{t('totalBudget')}</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1">${budgetStats.totalBudget.toLocaleString()}</h3>
                        <p className="text-blue-100 text-sm flex items-center gap-1">
                            <FaChartLine className="text-xs" />
                            {t('acrossActiveTrips')}
                        </p>
                    </div>
                </div>

                {/* Total Trips Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <MdPublic className="text-3xl" />
                            </div>
                            <span className="text-purple-100 text-sm font-semibold">{t('totalTrips')}</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1">{budgetStats.totalTrips}</h3>
                        <p className="text-purple-100 text-sm flex items-center gap-1">
                            <FaPlane className="text-xs" />
                            {t('newRecently')}
                        </p>
                    </div>
                </div>

                {/* Average Cost Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <MdTrendingUp className="text-3xl" />
                            </div>
                            <span className="text-pink-100 text-sm font-semibold">{t('avgCost')}</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1">${budgetStats.avgBudget.toLocaleString()}</h3>
                        <p className="text-pink-100 text-sm">{t('perItinerary')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Trips Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaPlane className="text-blue-600" />
                            {t('recentTrips')}
                        </h2>
                        <Link 
                            to="/my-trips" 
                            className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1 group"
                        >
                            {t('viewAll')}
                            <MdTrendingUp className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600" />
                        </div>
                    ) : trips.length > 0 ? (
                        <div className="space-y-4">
                            {trips.slice(0, 3).map((trip) => (
                                <Link
                                    key={trip.id}
                                    to={`/trips/${trip.id}`}
                                    className="group bg-white rounded-2xl p-5 shadow-sm border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col sm:flex-row gap-5"
                                >
                                    <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 relative shrink-0">
                                        {trip.coverPhotoUrl ? (
                                            <img 
                                                src={trip.coverPhotoUrl} 
                                                alt={trip.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-blue-300">
                                                <MdPlace className="text-5xl" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="flex-1 py-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {trip.name}
                                            </h3>
                                            <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold rounded-full shadow-md">
                                                {t('planned')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <MdDateRange className="text-blue-600" />
                                                <span className="font-medium">{trip.startDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <MdAttachMoney className="text-green-600" />
                                                <span className="font-medium">${trip.budget}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-blue-600 group-hover:underline">
                                            {t('manageItinerary')} →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-dashed border-blue-200">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <FaPlane className="text-white text-3xl" />
                            </div>
                            <p className="text-gray-600 mb-4 text-lg">{t('noTrips')}</p>
                            <Link
                                to="/create-trip"
                                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 text-lg"
                            >
                                {t('startAdventure')} →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recommended Destinations */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MdPlace className="text-purple-600" />
                        {t('recommended')}
                    </h2>
                    {recommendedDestinations.length > 0 ? (
                        <div className="space-y-4">
                            {recommendedDestinations.map(dest => (
                                <div 
                                    key={dest.id} 
                                    className="relative group overflow-hidden rounded-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                                >
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-purple-200">
                                        <img
                                            src={dest.imageUrl || `https://loremflickr.com/800/600/${dest.name},travel/all`}
                                            alt={dest.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => { 
                                                e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=500' 
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                        <div className="flex justify-between items-end text-white">
                                            <div>
                                                <h4 className="font-bold text-xl mb-1">{dest.name}</h4>
                                                <span className="text-white/90 text-sm flex items-center gap-1">
                                                    <MdPlace className="text-xs" />
                                                    {dest.country}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    toggleSave(dest.name); 
                                                }}
                                                className={`p-3 rounded-full backdrop-blur-md transition-all transform hover:scale-110 ${
                                                    savedDestinations.includes(dest.name) 
                                                        ? 'bg-red-500/80 text-white shadow-lg' 
                                                        : 'bg-white/20 text-white hover:bg-white/30'
                                                }`}
                                            >
                                                {savedDestinations.includes(dest.name) ? (
                                                    <MdFavorite className="text-xl" />
                                                ) : (
                                                    <MdFavoriteBorder className="text-xl" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm bg-gray-50 p-6 rounded-xl text-center">
                            {t('noRecommendations')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;