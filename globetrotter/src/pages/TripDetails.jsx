import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripProvider, useTrip } from '../context/TripContext';
import ItineraryView from '../components/trip/ItineraryView';
import BudgetView from '../components/trip/BudgetView';
import TimelineView from '../components/trip/TimelineView';
import { Calendar, MapPin, Plus, UserPlus, Edit2, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import api from '../lib/axios';

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
        const success = await updateTrip(trip.id, data);
        if (success) setShowEditTrip(false);
    };

    // Search state for adding stop
    const [newStop, setNewStop] = useState({
        cityId: '', cityName: '', arrivalDate: '', departureDate: '',
        transportCost: '', transportMode: 'Flight'
    });
    const [searchResults, setSearchResults] = useState([]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading trip...</div>;
    if (!trip) return <div className="min-h-screen flex items-center justify-center">Trip not found</div>;

    // Search Logic (kept local as it's UI specific)
    const handleSearchCity = async (e) => {
        const query = e.target.value;
        setNewStop({ ...newStop, cityName: query });
        if (query.length > 2) {
            try {
                const res = await api.get(`/cities/search?query=${query}`);
                setSearchResults(res.data);
            } catch (err) { console.error(err); }
        } else {
            setSearchResults([]);
        }
    };

    const selectCity = (city) => {
        setNewStop({ ...newStop, cityId: city.id, cityName: city.name });
        setSearchResults([]);
    };

    const handleSaveStop = async (e) => {
        e.preventDefault();
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
        } else {
            setError(result.message || "Failed to add stop. Please check dates.");
        }
    };

    const { totalSpent, isOverBudget } = budgetStats;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="relative h-72 rounded-3xl overflow-hidden mb-8 bg-gray-900 shadow-2xl mt-6">
                {trip.coverPhotoUrl ? (
                    <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className="text-5xl font-extrabold tracking-tight">{trip.name}</h1>
                                <button onClick={() => setShowEditTrip(true)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                                    <Edit2 size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm opacity-90 font-medium">
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Calendar size={18} /> {trip.startDate} - {trip.endDate}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    <Wallet size={18} /> Budget: {formatCurrency(trip.budget)}
                                </span>
                                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm font-bold ${isOverBudget ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}>
                                    Spent: {formatCurrency(totalSpent)}
                                </span>
                            </div>
                        </div>
                        <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition shadow-lg">
                            <UserPlus size={18} /> Share
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
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-md z-20 pt-4">
                {['itinerary', 'budget', 'calendar'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-bold tracking-wide transition-all capitalize px-2 relative ${activeTab === tab
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'itinerary' && (
                <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Your Journey</h2>
                        <button
                            onClick={() => setShowAddStop(!showAddStop)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            Add Destination
                        </button>
                    </div>

                    {showAddStop && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl mb-8 relative overflow-visible animate-slideDown">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Add New Destination</h3>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 animate-shake">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    {error}
                                </div>
                            )}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const errors = {};
                                if (!newStop.cityName) errors.cityName = "City is required";
                                if (!newStop.arrivalDate) errors.arrivalDate = "Required";
                                if (!newStop.departureDate) errors.departureDate = "Required";

                                if (Object.keys(errors).length > 0) {
                                    setFieldErrors(errors);
                                    return;
                                }
                                handleSaveStop(e);
                            }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" noValidate>
                                <div className="relative md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={newStop.cityName}
                                            onChange={(e) => { handleSearchCity(e); if (fieldErrors.cityName) setFieldErrors({ ...fieldErrors, cityName: null }); }}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all bg-gray-50 hover:bg-white ${fieldErrors.cityName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
                                            placeholder="Where to next?"
                                        />
                                    </div>
                                    {fieldErrors.cityName && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.cityName}</p>}
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-50 w-full bg-white shadow-2xl rounded-xl mt-2 max-h-60 overflow-y-auto border border-gray-100">
                                            {searchResults.map(city => (
                                                <div key={city.id} onClick={() => selectCity(city)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 font-medium border-b border-gray-50 last:border-0">
                                                    {city.name}, {city.country}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Arrival</label>
                                    <input
                                        type="date"
                                        value={newStop.arrivalDate}
                                        min={trip.startDate}
                                        max={trip.endDate}
                                        onChange={e => { setNewStop({ ...newStop, arrivalDate: e.target.value }); setError(null); if (fieldErrors.arrivalDate) setFieldErrors({ ...fieldErrors, arrivalDate: null }); }}
                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none bg-gray-50 ${fieldErrors.arrivalDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.arrivalDate && <p className="text-xs text-red-500 mt-1">{fieldErrors.arrivalDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departure</label>
                                    <input
                                        type="date"
                                        value={newStop.departureDate}
                                        min={trip.startDate}
                                        max={trip.endDate}
                                        onChange={e => { setNewStop({ ...newStop, departureDate: e.target.value }); setError(null); if (fieldErrors.departureDate) setFieldErrors({ ...fieldErrors, departureDate: null }); }}
                                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none bg-gray-50 ${fieldErrors.departureDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
                                    />
                                    {fieldErrors.departureDate && <p className="text-xs text-red-500 mt-1">{fieldErrors.departureDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transport Mode</label>
                                    <select
                                        value={newStop.transportMode}
                                        onChange={e => setNewStop({ ...newStop, transportMode: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                    >
                                        <option value="Flight">Flight</option>
                                        <option value="Train">Train</option>
                                        <option value="Bus">Bus</option>
                                        <option value="Car">Car</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transport Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={newStop.transportCost}
                                            onChange={e => setNewStop({ ...newStop, transportCost: parseFloat(e.target.value) || 0 })}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg font-medium transition-colors md:col-span-4 lg:col-span-1 border border-transparent bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg"
                                >
                                    Confirm
                                </button>
                            </form>
                        </div>
                    )}

                    <ItineraryView trip={trip} onUpdate={fetchTrip} />
                </div>
            )}

            {activeTab === 'budget' && <BudgetView />}
            {activeTab === 'calendar' && <TimelineView />}
        </div>
    );
};

export default TripDetails;

const EditTripModal = ({ trip, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        coverPhotoUrl: trip.coverPhotoUrl
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-slideUp">
                <h3 className="text-xl font-bold mb-4">Edit Trip Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Trip Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Budget</label>
                        <input
                            type="number"
                            value={formData.budget}
                            onChange={e => setFormData({ ...formData, budget: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-lg h-24"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};