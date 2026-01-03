import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTrip } from '../../context/TripContext';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, Calendar as CalendarIcon, List, MapPin, Coffee, Utensils, Camera, Flag } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import CalendarGrid from './CalendarGrid';

// Helper to get icons based on category
const getActivityIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'food': return <Utensils size={14} />;
        case 'sightseeing': return <Camera size={14} />;
        case 'adventure': return <Flag size={14} />;
        case 'relaxation': return <Coffee size={14} />;
        default: return <MapPin size={14} />;
    }
};

const TimelineView = () => {
    const { trip } = useTrip();
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    if (!trip) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fadeIn min-h-[600px]">
            {/* Header / Toggle */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Clock size={24} className="text-blue-600" />
                    {viewMode === 'list' ? t('tripTimeline') : t('interactiveCalendar')}
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List size={16} /> {t('timeline')}
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <CalendarIcon size={16} /> {t('calendar')}
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <CalendarGrid />
            ) : (
                <div className="max-w-3xl mx-auto pl-4">
                    {/* Vertical Line */}
                    <div className="space-y-12 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:via-blue-400 before:to-blue-200 before:opacity-50">

                        {trip.stops?.map((stop, i) => (
                            <div key={stop.id} className="relative pl-12 group">
                                {/* Stop Node */}
                                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white z-10 transition-transform group-hover:scale-110">
                                    <MapPin size={16} />
                                </div>

                                {/* Stop Card */}
                                <div className="bg-slate-50 p-5 rounded-xl border border-blue-100 mb-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{stop.cityName}</h3>
                                            <p className="text-sm text-blue-600 font-medium">{stop.arrivalDate} — {stop.departureDate}</p>
                                        </div>
                                        <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 border border-gray-100 uppercase tracking-widest">
                                            {t('destinations')} {i + 1}
                                        </div>
                                    </div>

                                    {stop.transportMode && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold mb-4">
                                            <span>{t('arrivingBy')} {stop.transportMode}</span>
                                        </div>
                                    )}

                                    {/* Activities List for this Stop */}
                                    <div className="space-y-3 mt-4">
                                        {stop.activities && stop.activities.length > 0 ? (
                                            stop.activities
                                                .sort((a, b) => (a.dayOffset || 0) - (b.dayOffset || 0)) // Sort by day
                                                .map(act => (
                                                    <div key={act.id} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-100 hover:border-blue-300 transition-colors">

                                                        {/* Day Badge */}
                                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-lg text-gray-500 border border-gray-200 shrink-0">
                                                            <span className="text-[10px] uppercase font-bold">{t('day')}</span>
                                                            <span className="text-lg font-bold leading-none text-gray-800">{(act.dayOffset || 0) + 1}</span>
                                                        </div>

                                                        <div className="grow">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-gray-800 text-sm">{act.name}</h4>
                                                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                    {act.startTime || '--:--'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${act.category === 'Food' ? 'bg-orange-50 text-orange-600' :
                                                                    act.category === 'Adventure' ? 'bg-red-50 text-red-600' :
                                                                        'bg-blue-50 text-blue-600'
                                                                    }`}>
                                                                    {getActivityIcon(act.category)}
                                                                    {act.category || t('activityName')}
                                                                </span>
                                                                {act.cost > 0 && <span className="text-xs text-gray-500 font-medium">{formatCurrency(act.cost)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-400 italic text-sm">{t('noActivities')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!trip.stops || trip.stops.length === 0) && (
                            <div className="pl-12 text-gray-500 text-lg">{t('yourItineraryEmpty')}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelineView;