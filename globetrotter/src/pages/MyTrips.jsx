import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MdDateRange,
    MdAttachMoney,
    MdPlace,
    MdAddCircle,
    MdDelete,
    MdArrowForward,
    MdEdit
} from 'react-icons/md';
import { FaPlane } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips');
            setTrips(response.data);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, tripName) => {
        if (!window.confirm(`${t('deleteTripQuestion')} "${tripName}"?`)) return;

        setDeletingId(id);
        try {
            await api.delete(`/trips/${id}`);
            setTrips(trips.filter(trip => trip.id !== id));
            toast.success('Trip deleted successfully');
        } catch (error) {
            console.error('Failed to delete', error);
            toast.error('Failed to delete trip');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
                        {t('myTrips')}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <FaPlane className="text-blue-600" />
                        {t('manageAdventures')}
                    </p>
                </div>
                <Link
                    to="/create-trip"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold transform hover:-translate-y-0.5"
                >
                    <MdAddCircle className="text-xl" />
                    {t('newTrip')}
                </Link>
            </div>

            {trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="group bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:border-blue-500 hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col"
                        >
                            {/* Cover Image */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 overflow-hidden">
                                {trip.coverPhotoUrl ? (
                                    <img
                                        src={trip.coverPhotoUrl}
                                        alt={trip.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <MdPlace className="text-7xl text-blue-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                                    {t('draft')}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {trip.name}
                                </h3>

                                {trip.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {trip.description}
                                    </p>
                                )}

                                {/* Trip Info */}
                                <div className="space-y-2 mb-5 flex-1">
                                    <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-2 rounded-lg">
                                        <MdDateRange className="text-blue-600 text-lg" />
                                        <span className="text-gray-700 font-medium">
                                            {trip.startDate} - {trip.endDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                                        <MdAttachMoney className="text-green-600 text-lg" />
                                        <span className="text-gray-700 font-medium">
                                            {t('budgetLabel')} {formatCurrency(trip.budget)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleDelete(trip.id, trip.name)}
                                        disabled={deletingId === trip.id}
                                        className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold disabled:opacity-50"
                                    >
                                        {deletingId === trip.id ? (
                                            <AiOutlineLoading3Quarters className="animate-spin" />
                                        ) : (
                                            <MdDelete className="text-lg" />
                                        )}
                                    </button>
                                    <Link
                                        to={`/edit-trip/${trip.id}`}
                                        className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all font-semibold"
                                    >
                                        <MdEdit className="text-lg" />
                                    </Link>
                                    <Link
                                        to={`/trips/${trip.id}`}
                                        className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
                                    >
                                        <MdArrowForward className="text-lg" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-blue-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <FaPlane className="text-white text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('noTripsFound')}</h3>
                    <p className="text-gray-600 mb-8 text-lg">{t('youHaventPlanned')}</p>
                    <Link
                        to="/create-trip"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg transform hover:-translate-y-0.5"
                    >
                        <MdAddCircle className="text-2xl" />
                        {t('startPlanning')}
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyTrips;