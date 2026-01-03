import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import api from '../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaCalendarAlt,
    FaWallet,
    FaMapMarkedAlt,
    FaClock,
    FaList,
    FaChartPie,
    FaSpinner,
    FaUserPlus,
    FaExclamationCircle,
    FaCheckCircle,
    FaRoute,
    FaCopy,
    FaShareAlt,
    FaPrint,
    FaPlane,
    FaTrain,
    FaBus,
    FaCar,
    FaUtensils,
    FaCamera,
    FaFlag,
    FaCoffee,
    FaMapMarkerAlt
} from 'react-icons/fa';

const SharedItinerary = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copying, setCopying] = useState(false);

    // Check if user is logged in
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            // This endpoint is now public
            const response = await api.get(`/trips/${id}`);
            setTrip(response.data);
        } catch (error) {
            console.error('Failed to fetch trip', error);
            setError('Trip not found or is private.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyTrip = async () => {
        if (!isLoggedIn) {
            toast.error('Please login to copy this trip');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (!window.confirm(`Do you want to copy "${trip.name}" to your account?`)) return;

        setCopying(true);
        const loadingToast = toast.loading('Copying itinerary...');

        try {
            const response = await api.post(`/trips/${id}/copy`);
            toast.success('Trip copied successfully!', { id: loadingToast });
            // Redirect to the new trip's details page
            setTimeout(() => navigate(`/trips/${response.data.id}`), 1000);
        } catch (error) {
            console.error('Copy failed', error);
            toast.error('Failed to copy trip', { id: loadingToast });
            setCopying(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const handlePrint = () => {
        window.print();
    };

    const getActivityIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'food': return <FaUtensils className="text-orange-500" />;
            case 'sightseeing': return <FaCamera className="text-blue-500" />;
            case 'adventure': return <FaFlag className="text-red-500" />;
            case 'relaxation': return <FaCoffee className="text-green-500" />;
            default: return <FaMapMarkerAlt className="text-purple-500" />;
        }
    };

    const getTransportIcon = (mode) => {
        switch (mode) {
            case 'Flight': return <FaPlane />;
            case 'Train': return <FaTrain />;
            case 'Bus': return <FaBus />;
            case 'Car': return <FaCar />;
            default: return <FaRoute />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading itinerary...</p>
                </div>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaExclamationCircle className="text-4xl text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Itinerary Unavailable</h2>
                    <p className="text-gray-500 mb-8">{error || 'This link may be expired or invalid.'}</p>
                    <a href="/" className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    const totalCost = trip.stops?.reduce((acc, stop) =>
        acc + (stop.transportCost || 0) + (stop.activities?.reduce((s, a) => s + (a.cost || 0), 0) || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:pb-0">
            <Toaster position="top-center" />

            {/* Navigation / Actions Bar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 print:hidden">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        GlobeTrotter
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Share Link"
                        >
                            <FaShareAlt size={18} />
                        </button>
                        <button
                            onClick={handlePrint}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                            title="Print Itinerary"
                        >
                            <FaPrint size={18} />
                        </button>
                        <button
                            onClick={handleCopyTrip}
                            disabled={copying}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-70"
                        >
                            {copying ? <FaSpinner className="animate-spin" /> : <FaCopy />}
                            {isLoggedIn ? 'Copy to My TRips' : 'Login to Copy'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] bg-gray-900 print:h-auto print:py-8">
                {trip.coverPhotoUrl ? (
                    <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover opacity-60 print:hidden" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 print:hidden" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent print:hidden"></div>

                <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto print:relative print:pb-0 print:px-0 print:text-black">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-2xl shadow-2xl max-w-3xl print:bg-transparent print:border-0 print:shadow-none print:p-0">
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-100 text-xs font-bold uppercase tracking-widest rounded-full mb-4 border border-blue-400/30 print:text-blue-600 print:border-blue-200">
                            Public Itinerary
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight print:text-black">
                            {trip.name}
                        </h1>
                        <p className="text-gray-200 text-lg mb-6 line-clamp-3 md:line-clamp-none print:text-gray-600">
                            {trip.description || "A curated travel itinerary."}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm font-semibold text-white print:text-gray-800">
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm print:bg-gray-100">
                                <FaCalendarAlt className="text-blue-400" />
                                {trip.startDate} - {trip.endDate}
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm print:bg-gray-100">
                                <FaWallet className="text-green-400" />
                                Est. Budget: {formatCurrency(trip.budget)}
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm print:bg-gray-100">
                                <FaChartPie className="text-purple-400" />
                                Total Est. Cost: {formatCurrency(totalCost)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 print:mt-8 print:px-0">
                <div className="space-y-8">
                    {/* Stops Timeline */}
                    {trip.stops && trip.stops.length > 0 ? (
                        trip.stops.map((stop, index) => (
                            <div key={stop.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 print:shadow-none print:border-2">
                                {/* Stop Header */}
                                <div className="bg-gray-50 border-b border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                {stop.cityName}
                                            </h2>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <FaClock className="text-blue-500" />
                                                    {stop.arrivalDate} — {stop.departureDate}
                                                </span>
                                                {stop.transportMode && (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase tracking-wider">
                                                        {getTransportIcon(stop.transportMode)}
                                                        {stop.transportMode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {stop.transportCost > 0 && (
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Transport Cost</div>
                                            <div className="text-lg font-bold text-gray-900">{formatCurrency(stop.transportCost)}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Activities */}
                                <div className="p-6 sm:p-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-gray-200"></span>
                                        Itinerary Activities
                                        <span className="w-full h-0.5 bg-gray-200"></span>
                                    </h3>

                                    {stop.activities && stop.activities.length > 0 ? (
                                        <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 print:before:hidden">
                                            {stop.activities
                                                .sort((a, b) => (a.dayOffset || 0) - (b.dayOffset || 0))
                                                .map((activity, idx) => (
                                                    <div key={activity.id} className="relative pl-20 group">
                                                        {/* Timeline Node */}
                                                        <div className="absolute left-0 top-0 w-16 text-center print:static print:w-auto print:text-left print:mb-2">
                                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day</div>
                                                            <div className="text-2xl font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                                {(activity.dayOffset || 0) + 1}
                                                            </div>
                                                        </div>

                                                        <div className="bg-white border border-gray-100 p-5 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group-hover:translate-x-1 print:border-gray-200 print:shadow-none print:hover:transform-none">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="flex gap-4">
                                                                    <div className="mt-1 text-xl shrink-0">
                                                                        {getActivityIcon(activity.category)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-3 mb-1">
                                                                            <h4 className="text-lg font-bold text-gray-900">{activity.name}</h4>
                                                                            <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">
                                                                                {activity.category}
                                                                            </span>
                                                                        </div>
                                                                        {activity.description && (
                                                                            <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                                                                        )}
                                                                        {activity.startTime && (
                                                                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                                                <FaClock />
                                                                                {activity.startTime}
                                                                                {activity.endTime ? ` - ${activity.endTime}` : ''}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {activity.cost > 0 && (
                                                                    <div className="text-right shrink-0">
                                                                        <div className="text-lg font-bold text-gray-900">{formatCurrency(activity.cost)}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 italic">No specific activities planned for this destination yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white rounded-2xl shadow-lg border border-gray-100">
                            <FaMapMarkedAlt className="text-6xl text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Empty Itinerary</h3>
                            <p className="text-gray-500">This trip planner hasn't added any destinations yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer Call to Action */}
                <div className="mt-16 mb-12 text-center print:hidden">
                    {!isLoggedIn ? (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 md:p-12 shadow-2xl">
                            <h2 className="text-3xl font-bold mb-4">Inspired by this trip?</h2>
                            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                                Create your own account on GlobeTrotter to copy this itinerary, customize it, and start planning your next adventure!
                            </p>
                            <a
                                href="/signup"
                                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-50 hover:scale-105 transition-all"
                            >
                                Start Your Journey Free
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            Powered by GlobeTrotter — The future of travel planning.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedItinerary;