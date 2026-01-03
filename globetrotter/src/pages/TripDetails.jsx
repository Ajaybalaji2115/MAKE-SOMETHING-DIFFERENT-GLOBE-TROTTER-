import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripProvider, useTrip } from '../context/TripContext';
import ItineraryView from '../components/trip/ItineraryView';
import BudgetView from '../components/trip/BudgetView';
import TimelineView from '../components/trip/TimelineView';
import { formatCurrency } from '../utils/currency';
import api from '../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaPlus,
    FaUserPlus,
    FaEdit,
    FaWallet,
    FaSpinner,
    FaTimes,
    FaCheck,
    FaExclamationTriangle,
    FaList,
    FaChartPie,
    FaClock,
    FaPlane,
    FaTrain,
    FaBus,
    FaCar,
    FaRoute,
    FaDollarSign,
    FaSearchLocation
} from 'react-icons/fa';

const TripDetails = () => {
    const { id } = useParams();
    return (
        <TripProvider tripId={id}>
            <TripDetailsContent />
        </TripProvider>
    );
};

const TripDetailsContent = () => {
    const { trip, loading, budgetStats, addStop, updateTrip, fetchTrip } = useTrip();
    const [activeTab, setActiveTab] = useState('itinerary');
    const [showAddStop, setShowAddStop] = useState(false);
    const [showEditTrip, setShowEditTrip] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleUpdateTrip = async (data) => {
        const loadingToast = toast.loading('Updating trip...');
        const success = await updateTrip(trip.id, data);
        if (success) {
            setShowEditTrip(false);
            toast.success('Trip updated successfully!', { id: loadingToast });
        } else {
            toast.error('Failed to update trip', { id: loadingToast });
        }
    };

    const [newStop, setNewStop] = useState({
        cityId: '', cityName: '', arrivalDate: '', departureDate: '',
        transportCost: '', transportMode: 'Flight'
    });
    const [searchResults, setSearchResults] = useState([]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Loading trip...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Trip not found</p>
                </div>
            </div>
        );
    }

    const handleSearchCity = async (e) => {
        const query = e.target.value;
        setNewStop({ ...newStop, cityName: query });
        if (query.length > 2) {
            try {
                const res = await api.get(`/cities/search?query=${query}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to search cities');
            }
        } else {
            setSearchResults([]);
        }
    };

    const selectCity = (city) => {
        setNewStop({ ...newStop, cityId: city.id, cityName: city.name });
        setSearchResults([]);
        toast.success(`Selected: ${city.name}`);
    };

    const handleSaveStop = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Adding destination...');

        const result = await addStop({
            cityId: newStop.cityId,
            cityName: newStop.cityName,
            arrivalDate: newStop.arrivalDate,
            departureDate: newStop.departureDate,
            transportCost: newStop.transportCost,
            transportMode: newStop.transportMode
        });

        if (result.success) {
            setShowAddStop(false);
            setNewStop({
                cityId: '', cityName: '', arrivalDate: '', departureDate: '',
                transportCost: '', transportMode: 'Flight'
            });
            setError(null);
            setFieldErrors({});
            toast.success('Destination added successfully!', { id: loadingToast });
        } else {
            setError(result.message || "Failed to add stop. Please check dates.");
            toast.error(result.message || 'Failed to add destination', { id: loadingToast });
        }
    };

    const { totalSpent, isOverBudget } = budgetStats;

    const transportIcons = {
        Flight: FaPlane,
        Train: FaTrain,
        Bus: FaBus,
        Car: FaCar
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />

            <div className="max-w-7xl mx-auto pt-6">
                {/* Hero Header */}
                <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
                    {trip.coverPhotoUrl ? (
                        <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4 flex-wrap">
                                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">{trip.name}</h1>
                                    <button
                                        onClick={() => setShowEditTrip(true)}
                                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
                                    >
                                        <FaEdit size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
                                        <FaCalendarAlt size={16} /> {trip.startDate} - {trip.endDate}
                                    </span>
                                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
                                        <FaWallet size={16} /> Budget: {formatCurrency(trip.budget)}
                                    </span>
                                    <span className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md font-bold transition-all ${isOverBudget ? 'bg-red-500/80 hover:bg-red-600/80' : 'bg-emerald-500/80 hover:bg-emerald-600/80'}`}>
                                        <FaDollarSign size={16} /> Spent: {formatCurrency(totalSpent)}
                                    </span>
                                </div>
                            </div>
                            <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                                <FaUserPlus size={18} /> Share Trip
                            </button>
                        </div>
                    </div>
                </div>

                {/* Edit Trip Modal */}
                {showEditTrip && (
                    <EditTripModal
                        trip={trip}
                        onClose={() => setShowEditTrip(false)}
                        onSave={handleUpdateTrip}
                    />
                )}

                {/* Navigation Tabs */}
                <div className="flex items-center gap-4 md:gap-8 border-b-2 border-gray-200 mb-8 overflow-x-auto bg-white/80 backdrop-blur-md rounded-t-2xl px-4 sticky top-0 z-20 shadow-md">
                    {[
                        { id: 'itinerary', label: 'Itinerary', icon: FaList },
                        { id: 'budget', label: 'Budget', icon: FaChartPie },
                        { id: 'calendar', label: 'Calendar', icon: FaRoute }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 pt-4 px-2 font-bold transition-all capitalize whitespace-nowrap relative ${activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <tab.icon className="text-lg" />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'itinerary' && (
                    <div className="animate-fadeIn">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-blue-600" />
                                Your Journey
                            </h2>
                            <button
                                onClick={() => setShowAddStop(!showAddStop)}
                                className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
                            >
                                <FaPlus size={18} className="group-hover:rotate-90 transition-transform" />
                                Add Destination
                            </button>
                        </div>

                        {showAddStop && (
                            <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl mb-8 relative overflow-visible animate-slideDown">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                        <FaSearchLocation className="text-blue-600" />
                                        Add New Destination
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowAddStop(false);
                                            setError(null);
                                            setFieldErrors({});
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <FaTimes className="text-gray-500" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border-2 border-red-200 flex items-center gap-3 animate-shake">
                                        <FaExclamationTriangle className="text-xl flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* City Search */}
                                    <div className="relative md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-blue-600" />
                                            City
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newStop.cityName}
                                                onChange={(e) => {
                                                    handleSearchCity(e);
                                                    if (fieldErrors.cityName) setFieldErrors({ ...fieldErrors, cityName: null });
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 outline-none transition-all bg-gray-50 hover:bg-white ${fieldErrors.cityName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                                                placeholder="Search for a city..."
                                            />
                                        </div>
                                        {fieldErrors.cityName && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.cityName}</p>}
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-50 w-full bg-white shadow-2xl rounded-xl mt-2 max-h-60 overflow-y-auto border-2 border-gray-200">
                                                {searchResults.map(city => (
                                                    <div
                                                        key={city.id}
                                                        onClick={() => selectCity(city)}
                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium border-b border-gray-100 last:border-0 flex items-center gap-2 transition-colors"
                                                    >
                                                        <FaMapMarkerAlt className="text-blue-500 text-xs" />
                                                        {city.name}, {city.country}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrival Date */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaCalendarAlt className="text-green-600" />
                                            Arrival
                                        </label>
                                        <input
                                            type="date"
                                            value={newStop.arrivalDate}
                                            min={trip.startDate}
                                            max={trip.endDate}
                                            onChange={e => {
                                                setNewStop({ ...newStop, arrivalDate: e.target.value });
                                                setError(null);
                                                if (fieldErrors.arrivalDate) setFieldErrors({ ...fieldErrors, arrivalDate: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 outline-none bg-gray-50 transition-all ${fieldErrors.arrivalDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-100 focus:border-green-500'}`}
                                        />
                                        {fieldErrors.arrivalDate && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.arrivalDate}</p>}
                                    </div>

                                    {/* Departure Date */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaCalendarAlt className="text-red-600" />
                                            Departure
                                        </label>
                                        <input
                                            type="date"
                                            value={newStop.departureDate}
                                            min={trip.startDate}
                                            max={trip.endDate}
                                            onChange={e => {
                                                setNewStop({ ...newStop, departureDate: e.target.value });
                                                setError(null);
                                                if (fieldErrors.departureDate) setFieldErrors({ ...fieldErrors, departureDate: null });
                                            }}
                                            className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 outline-none bg-gray-50 transition-all ${fieldErrors.departureDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-red-100 focus:border-red-500'}`}
                                        />
                                        {fieldErrors.departureDate && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.departureDate}</p>}
                                    </div>

                                    {/* Transport Mode */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaPlane className="text-purple-600" />
                                            Transport Mode
                                        </label>
                                        <div className="relative">
                                            {React.createElement(transportIcons[newStop.transportMode], {
                                                className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            })}
                                            <select
                                                value={newStop.transportMode}
                                                onChange={e => setNewStop({ ...newStop, transportMode: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none bg-gray-50 appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="Flight">Flight</option>
                                                <option value="Train">Train</option>
                                                <option value="Bus">Bus</option>
                                                <option value="Car">Car</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Transport Cost */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaDollarSign className="text-yellow-600" />
                                            Transport Cost
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                            <input
                                                type="number"
                                                value={newStop.transportCost}
                                                onChange={e => setNewStop({ ...newStop, transportCost: parseFloat(e.target.value) || 0 })}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 outline-none bg-gray-50 transition-all"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const errors = {};
                                                if (!newStop.cityName) errors.cityName = "City is required";
                                                if (!newStop.arrivalDate) errors.arrivalDate = "Required";
                                                if (!newStop.departureDate) errors.departureDate = "Required";

                                                if (Object.keys(errors).length > 0) {
                                                    setFieldErrors(errors);
                                                    toast.error('Please fill in all required fields');
                                                    return;
                                                }
                                                handleSaveStop(e);
                                            }}
                                            className="w-full px-6 py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <FaCheck /> Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ItineraryView trip={trip} onUpdate={fetchTrip} />
                    </div>
                )}

                {activeTab === 'budget' && <BudgetView />}
                {activeTab === 'calendar' && <TimelineView />}
            </div>
        </div>
    );
};

export default TripDetails;

const EditTripModal = ({ trip, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: trip?.name || '',
        description: trip?.description || '',
        startDate: trip?.startDate || '',
        endDate: trip?.endDate || '',
        budget: trip?.budget || '',
        coverPhotoUrl: trip?.coverPhotoUrl || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-slideUp max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaEdit className="text-blue-600" />
                        Edit Trip Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes className="text-gray-500 text-xl" />
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-600" />
                            Trip Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-green-600" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-red-600" />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <FaDollarSign className="text-yellow-600" />
                            Budget
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input
                                type="number"
                                value={formData.budget}
                                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 outline-none"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <FaList className="text-purple-600" />
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl h-32 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none resize-none"
                            placeholder="Describe your trip..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                            <FaTimes /> Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-95"
                        >
                            <FaCheck /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};