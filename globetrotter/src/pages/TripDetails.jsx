import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, DollarSign, MapPin, Plus, Trash2, PieChart as PieChartIcon, Clock, List } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../lib/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TripDetails = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [showAddStop, setShowAddStop] = useState(false);

    const [newStop, setNewStop] = useState({ cityId: '', cityName: '', arrivalDate: '', departureDate: '' });
    const [searchResults, setSearchResults] = useState([]);

    const getChartData = () => {
        if (!trip || !trip.stops) return [];
        const data = {};
        trip.stops.forEach(stop => {
            if (stop.activities) {
                stop.activities.forEach(act => {
                    const cat = act.category || 'Other';
                    data[cat] = (data[cat] || 0) + act.cost;
                });
            }
        });
        return Object.keys(data).map(key => ({ name: key, value: data[key] }));
    };

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const response = await api.get(`/trips/${id}`);
            setTrip(response.data);
        } catch (error) {
            console.error('Failed to fetch trip', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleAddStop = async (e) => {
        e.preventDefault();
        try {
            await api.post('/itinerary/stops', {
                tripId: id,
                cityId: newStop.cityId,
                arrivalDate: newStop.arrivalDate,
                departureDate: newStop.departureDate
            });
            setShowAddStop(false);
            setNewStop({ cityId: '', cityName: '', arrivalDate: '', departureDate: '' });
            fetchTrip();
        } catch (err) { console.error(err); }
    };

    const handleDeleteStop = async (stopId) => {
        if (!window.confirm("Remove this stop?")) return;
        try {
            await api.delete(`/itinerary/stops/${stopId}`);
            fetchTrip();
        } catch (err) { console.error(err); }
    };

    const handleAddActivity = async (stopId) => {
        const name = prompt("Activity Name:");
        if (!name) return;
        const cost = parseFloat(prompt("Cost:", "0"));
        const category = prompt("Category (Food, Sightseeing, Transport):", "Sightseeing");

        try {
            await api.post('/itinerary/activities', {
                stopId, name, cost, category, description: ''
            });
            fetchTrip();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-8 text-center">Loading trip...</div>;
    if (!trip) return <div className="p-8 text-center">Trip not found</div>;

    const totalCost = trip.stops ? trip.stops.reduce((acc, stop) => acc + (stop.activities ? stop.activities.reduce((s, a) => s + a.cost, 0) : 0), 0) : 0;
    const chartData = getChartData();

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="relative h-64 rounded-xl overflow-hidden mb-8 bg-gray-900">
                {trip.coverPhotoUrl ? (
                    <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80" />
                )}
                <div className="absolute bottom-0 left-0 p-8 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm opacity-90 font-medium">
                        <span className="flex items-center gap-2"><Calendar size={18} /> {trip.startDate} - {trip.endDate}</span>
                        <span className="flex items-center gap-2"><DollarSign size={18} /> Budget: ${trip.budget}</span>
                        <span className={`px-2 py-0.5 rounded ${totalCost > trip.budget ? 'bg-red-500' : 'bg-green-500'}`}>
                            Est. Cost: ${totalCost}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
                {['itinerary', 'budget', 'calendar'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-medium transition-colors capitalize whitespace-nowrap px-2 ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'itinerary' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Trip Itinerary</h2>
                        <button onClick={() => setShowAddStop(!showAddStop)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
                            <Plus size={20} /> Add Destination
                        </button>
                    </div>

                    {showAddStop && (
                        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-fadeIn mb-6 relative overflow-visible">
                            <h3 className="font-semibold mb-4 text-gray-800">Add a new stop</h3>
                            <form onSubmit={handleAddStop} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={newStop.cityName}
                                        onChange={handleSearchCity}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none"
                                        placeholder="Search city..."
                                        required
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-50 w-full bg-white shadow-xl rounded-lg mt-1 max-h-40 overflow-y-auto border border-gray-100">
                                            {searchResults.map(city => (
                                                <div key={city.id} onClick={() => selectCity(city)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700">
                                                    {city.name}, {city.country}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Arrival</label>
                                    <input type="date" value={newStop.arrivalDate} onChange={e => setNewStop({ ...newStop, arrivalDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Departure</label>
                                    <input type="date" value={newStop.departureDate} onChange={e => setNewStop({ ...newStop, departureDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300" required />
                                </div>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Stop</button>
                            </form>
                        </div>
                    )}

                    <div className="space-y-6">
                        {trip.stops && trip.stops.length > 0 ? (
                            trip.stops.map((stop, index) => (
                                <div key={stop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{stop.cityName}</h3>
                                                <p className="text-sm text-gray-500 font-medium">{stop.arrivalDate} — {stop.departureDate}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteStop(stop.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                <List size={14} /> Activities
                                            </h4>
                                            <button onClick={() => handleAddActivity(stop.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                                <Plus size={16} /> Add Activity
                                            </button>
                                        </div>

                                        {stop.activities && stop.activities.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {stop.activities.map(activity => (
                                                    <div key={activity.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-lg hover:border-blue-200 transition-colors shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                                            <div>
                                                                <div className="font-medium text-gray-800 text-sm">{activity.name}</div>
                                                                <div className="text-xs text-gray-500">{activity.category}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-700">${activity.cost}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
                                                No activities planned yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Start your itinerary</h3>
                                <p className="text-gray-500 mb-6">Add your first destination to get started.</p>
                                <button onClick={() => setShowAddStop(true)} className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all">
                                    Add Destination
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'budget' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><PieChartIcon size={20} /> Cost Distribution</h3>
                        {chartData.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">No cost data available</div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-6">Budget Overview</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Total Budget</span>
                                <span className="text-xl font-bold text-gray-900">${trip.budget}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Total Expenses</span>
                                <span className={`text-xl font-bold ${totalCost > trip.budget ? 'text-red-600' : 'text-green-600'}`}>
                                    ${totalCost}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Remaining</span>
                                <span className="text-xl font-bold text-gray-900">${trip.budget - totalCost}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock size={20} /> Trip Timeline</h2>
                    <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
                        {trip.stops && trip.stops.map((stop, i) => (
                            <div key={stop.id} className="relative pl-12">
                                <div className="absolute left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm transform -translate-x-1/2"></div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="font-bold text-lg text-gray-800">{stop.cityName}</div>
                                    <div className="text-sm text-gray-500 mb-2">{stop.arrivalDate} to {stop.departureDate}</div>
                                    <div className="space-y-1">
                                        {stop.activities && stop.activities.map(act => (
                                            <div key={act.id} className="text-sm text-gray-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                {act.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!trip.stops || trip.stops.length === 0) && <div className="pl-12 text-gray-500">No stops to show on timeline.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDetails;
