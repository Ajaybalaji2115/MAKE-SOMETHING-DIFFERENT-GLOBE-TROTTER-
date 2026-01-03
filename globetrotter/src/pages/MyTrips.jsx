import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, MapPin, PlusCircle, Trash2 } from 'lucide-react';
import api from '../lib/axios';

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        try {
            // Backend delete endpoint not implemented yet in Controller, but good to have UI ready.
            // assuming api.delete(`/trips/${id}`)
            // For now, just filter locally or log
            console.log('Delete trip', id);
            // await api.delete(`/trips/${id}`);
            // fetchTrips();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                    <p className="text-gray-500 mt-2">Manage all your planned adventures.</p>
                </div>
                <Link
                    to="/create-trip"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} />
                    Create New Trip
                </Link>
            </div>

            {trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {trip.coverPhotoUrl ? (
                                    <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                                        <MapPin size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                                    Draft
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{trip.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{trip.description}</p>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>{trip.startDate} - {trip.endDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} className="text-gray-400" />
                                        <span>Budget: ${trip.budget}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <button
                                        onClick={() => handleDelete(trip.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <Link
                                        to={`/trips/${trip.id}`}
                                        className="text-blue-600 font-medium hover:text-blue-700 text-sm"
                                    >
                                        Manage Itinerary →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No trips found</h3>
                    <p className="text-gray-500 mb-6">You haven't planned any trips yet.</p>
                    <Link
                        to="/create-trip"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <PlusCircle size={20} />
                        Start Planning
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyTrips;
