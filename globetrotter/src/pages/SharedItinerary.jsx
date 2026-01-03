import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Wallet, MapPin, Clock, List, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../lib/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SharedItinerary = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            // Assuming public endpoint or using same endpoint if authentication is optional/handled
            // For now, using same endpoint but this normally requires public access config in backend SecurityConfig
            const response = await api.get(`/trips/${id}`);
            setTrip(response.data);
        } catch (error) {
            console.error('Failed to fetch trip', error);
            setError('Trip not found or private.');
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <div className="p-20 text-center">Loading shared itinerary...</div>;
    if (error || !trip) return <div className="p-20 text-center text-red-500">{error || 'Trip not found'}</div>;

    const totalCost = trip.stops ? trip.stops.reduce((acc, stop) => acc + (stop.activities ? stop.activities.reduce((s, a) => s + a.cost, 0) : 0), 0) : 0;
    const chartData = getChartData();

    return (
        <div className="max-w-7xl mx-auto pb-20 pt-4">
            <div className="bg-blue-600 text-white p-4 text-center rounded-lg mb-6 shadow-md">
                You are viewing a shared itinerary. <a href="/signup" className="underline font-bold hover:text-blue-200">Sign up</a> to create your own!
            </div>

            <div className="relative h-64 rounded-xl overflow-hidden mb-8 bg-gray-900">
                {trip.coverPhotoUrl ? (
                    <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900 opacity-80" />
                )}
                <div className="absolute bottom-0 left-0 p-8 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm opacity-90 font-medium">
                        <span className="flex items-center gap-2"><Calendar size={18} /> {trip.startDate} - {trip.endDate}</span>
                        <span className="flex items-center gap-2"><Wallet size={18} /> Budget: {formatCurrency(trip.budget)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
                {['itinerary', 'timeline', 'budget'].map(tab => (
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
                <div className="space-y-6 animate-fadeIn">
                    {trip.stops && trip.stops.length > 0 ? (
                        trip.stops.map((stop, index) => (
                            <div key={stop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 flex items-center gap-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{stop.cityName}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{stop.arrivalDate} — {stop.departureDate}</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    {stop.activities && stop.activities.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {stop.activities.map(activity => (
                                                <div key={activity.id} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                                        <div>
                                                            <div className="font-medium text-gray-800 text-sm">{activity.name}</div>
                                                            <div className="text-xs text-gray-500">{activity.category}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700">{formatCurrency(activity.cost)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">No activities listed.</div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">This itinerary is empty.</div>
                    )}
                </div>
            )}

            {activeTab === 'timeline' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
                        {trip.stops && trip.stops.map((stop, i) => (
                            <div key={stop.id} className="relative pl-12">
                                <div className="absolute left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm transform -translate-x-1/2"></div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="font-bold text-lg text-gray-800">{stop.cityName}</div>
                                    <div className="text-sm text-gray-500 mb-2">{stop.arrivalDate} to {stop.departureDate}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'budget' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><PieChartIcon size={20} /> Estimated Costs</h3>
                    {chartData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-10">No cost data available.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SharedItinerary;