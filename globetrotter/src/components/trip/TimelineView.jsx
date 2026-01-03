import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTrip } from '../../context/TripContext';
import { useLanguage } from '../../context/LanguageContext';
import CalendarGrid from './CalendarGrid';
import { 
    FaClock, 
    FaCalendarAlt, 
    FaList, 
    FaMapMarkerAlt, 
    FaUtensils, 
    FaCamera, 
    FaFlag, 
    FaCoffee,
    FaRoute
} from 'react-icons/fa';

// Helper to get icons based on category
const getActivityIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'food': return <FaUtensils className="text-orange-600" />;
        case 'sightseeing': return <FaCamera className="text-blue-600" />;
        case 'adventure': return <FaFlag className="text-red-600" />;
        case 'relaxation': return <FaCoffee className="text-green-600" />;
        default: return <FaMapMarkerAlt className="text-purple-600" />;
    }
};

const TimelineView = () => {
    const { trip } = useTrip();
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState('list');

    if (!trip) return null;

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border-2 border-gray-100 animate-fadeIn min-h-[600px]">
            {/* Header / Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-900">
                    {viewMode === 'list' ? (
                        <>
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg">
                                <FaClock size={24} />
                            </div>
                            {t('tripTimeline')}
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white shadow-lg">
                                <FaCalendarAlt size={24} />
                            </div>
                            {t('interactiveCalendar')}
                        </>
                    )}
                </h2>
                <div className="flex bg-gray-100 p-1.5 rounded-xl shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-bold ${
                            viewMode === 'list' 
                                ? 'bg-white shadow-md text-blue-600 scale-105' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <FaList size={16} /> {t('timeline')}
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-bold ${
                            viewMode === 'grid' 
                                ? 'bg-white shadow-md text-blue-600 scale-105' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <FaCalendarAlt size={16} /> {t('calendar')}
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <CalendarGrid />
            ) : (
                <div className="max-w-4xl mx-auto pl-4">
                    {/* Vertical Line */}
                    <div className="space-y-12 relative before:absolute before:left-5 before:top-4 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-blue-400 before:via-purple-400 before:to-blue-400 before:opacity-40 before:rounded-full">

                        {trip.stops?.map((stop, i) => (
                            <div key={stop.id} className="relative pl-16 group">
                                {/* Stop Node */}
                                <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center text-white z-10 transition-all group-hover:scale-125 group-hover:rotate-12">
                                    <FaMapMarkerAlt size={18} />
                                </div>

                                {/* Stop Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-gray-100 mb-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-2xl text-gray-900 flex items-center gap-2 mb-2">
                                                <FaRoute className="text-blue-600" />
                                                {stop.cityName}
                                            </h3>
                                            <p className="text-sm text-blue-600 font-semibold flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex">
                                                <FaClock className="text-blue-500" />
                                                {stop.arrivalDate} — {stop.departureDate}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">
                                            Stop {i + 1}
                                        </div>
                                    </div>

                                    {stop.transportMode && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold mb-4 shadow-sm">
                                            <FaRoute />
                                            <span>{t('arrivingBy')} {stop.transportMode}</span>
                                        </div>
                                    )}

                                    {/* Activities List for this Stop */}
                                    <div className="space-y-3 mt-4">
                                        {stop.activities && stop.activities.length > 0 ? (
                                            stop.activities
                                                .sort((a, b) => (a.dayOffset || 0) - (b.dayOffset || 0))
                                                .map(act => (
                                                    <div key={act.id} className="flex gap-4 items-center bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-lg group/activity">

                                                        {/* Day Badge */}
                                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-gray-500 border-2 border-gray-200 shrink-0 group-hover/activity:border-blue-300 transition-all">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400">Day</span>
                                                            <span className="text-xl font-bold leading-none text-gray-800">{(act.dayOffset || 0) + 1}</span>
                                                        </div>

                                                        <div className="grow">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-gray-900 text-base">{act.name}</h4>
                                                                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-semibold">
                                                                    {act.startTime || '--:--'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
                                                                    act.category === 'Food' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                                    act.category === 'Adventure' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                                    'bg-blue-100 text-blue-700 border border-blue-200'
                                                                }`}>
                                                                    {getActivityIcon(act.category)}
                                                                    {act.category || t('activityName')}
                                                                </span>
                                                                {act.cost > 0 && (
                                                                    <span className="text-sm text-gray-600 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                                                                        {formatCurrency(act.cost)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 italic text-sm border-2 border-dashed border-gray-200">
                                                <FaList className="mx-auto mb-2 text-2xl opacity-50" />
                                                {t('noActivities')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!trip.stops || trip.stops.length === 0) && (
                            <div className="pl-16 py-20 text-center">
                                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                    <FaMapMarkerAlt className="text-5xl text-gray-300" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">{t('yourItineraryEmpty')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelineView;