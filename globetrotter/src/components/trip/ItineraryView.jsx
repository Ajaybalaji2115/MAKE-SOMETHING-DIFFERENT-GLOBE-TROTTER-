import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusCircle, MapPin, Calendar, GripVertical, Trash2, Edit2, Clock, DollarSign, Navigation, MoreVertical, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/axios';
import { useLanguage } from '../../context/LanguageContext';

const ConfirmationModal = ({ title, message, onClose, onConfirm, isDangerous = false }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ItineraryView = ({ trip, onUpdate }) => {
    const { t } = useLanguage();
    const [stops, setStops] = useState(trip?.stops || []);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [currentStop, setCurrentStop] = useState(null);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, stopId: null });

    useEffect(() => {
        if (trip?.stops) {
            setStops(trip.stops);
        }
    }, [trip?.stops]);

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'STOP') {
            const newStops = Array.from(stops);
            const [reorderedStop] = newStops.splice(source.index, 1);
            newStops.splice(destination.index, 0, reorderedStop);

            setStops(newStops);
            // Call API to update stop order
            try {
                // Mock API call - in reality update order index
                await api.put(`/trips/${trip.id}/stops/reorder`, { stops: newStops });
                onUpdate();
            } catch (err) {
                console.error("Failed to reorder stops", err);
            }
        } else if (type === 'ACTIVITY') {
            // Activity reordering logic within a stop
            const stopId = source.droppableId;
            const stopIndex = stops.findIndex(s => s.id === stopId);
            const stop = stops[stopIndex];

            const newActivities = Array.from(stop.activities || []);
            const [reorderedActivity] = newActivities.splice(source.index, 1);
            newActivities.splice(destination.index, 0, reorderedActivity);

            const newStops = [...stops];
            newStops[stopIndex] = { ...stop, activities: newActivities };
            setStops(newStops);

            try {
                await api.put(`/trips/${trip.id}/stops/${stopId}/activities/reorder`, { activities: newActivities });
                onUpdate();
            } catch (err) {
                console.error("Failed to reorder activities", err);
            }
        }
    };

    const handleDeleteStop = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/trips/${trip.id}/stops/${deleteConfirm.id}`);
            onUpdate();
            setDeleteConfirm({ type: null, id: null });
        } catch (err) {
            console.error("Failed to delete stop", err);
        }
    };

    const handleDeleteActivity = async () => {
        if (!deleteConfirm.id || !deleteConfirm.stopId) return;
        try {
            await api.delete(`/trips/${trip.id}/stops/${deleteConfirm.stopId}/activities/${deleteConfirm.id}`);
            onUpdate();
            setDeleteConfirm({ type: null, id: null });
        } catch (err) {
            console.error("Failed to delete activity", err);
        }
    };

    const handleSaveStop = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const stopData = Object.fromEntries(formData.entries());

        try {
            if (currentStop?.id) {
                await api.put(`/trips/${trip.id}/stops/${currentStop.id}`, stopData);
            } else {
                await api.post(`/trips/${trip.id}/stops`, stopData);
            }
            onUpdate();
            setIsStopModalOpen(false);
            setCurrentStop(null);
        } catch (err) {
            console.error("Failed to save stop", err);
        }
    };

    const handleSaveActivity = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const activityData = Object.fromEntries(formData.entries());

        // Ensure cost is a number
        if (activityData.cost) activityData.cost = parseFloat(activityData.cost);

        try {
            if (currentActivity?.id) {
                await api.put(`/trips/${trip.id}/stops/${currentStop.id}/activities/${currentActivity.id}`, activityData);
            } else {
                await api.post(`/trips/${trip.id}/stops/${currentStop.id}/activities`, activityData);
            }
            onUpdate();
            setIsActivityModalOpen(false);
            setCurrentActivity(null);
            setCurrentStop(null);
        } catch (err) {
            console.error("Failed to save activity", err);
        }
    };

    // Helper to get duration text
    const getDuration = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} ${diffDays === 1 ? t('day') : t('days')}`;
    };

    if (!trip) return <div className="text-center py-10 text-gray-500">{t('noItineraryData')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('itinerary')}</h2>
                    <p className="text-gray-500">{t('manageItinerary')}</p>
                </div>
                <button
                    onClick={() => { setCurrentStop(null); setIsStopModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <PlusCircle size={20} />
                    {t('addDestination')}
                </button>
            </div>

            {stops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600">
                        <MapPin size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('startYourJourney')}</h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">{t('haventAddedDestinations')}</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="stops" type="STOP">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8">
                                {stops.map((stop, index) => (
                                    <Draggable key={stop.id} draggableId={String(stop.id)} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                                            >
                                                {/* Stop Header */}
                                                <div className="bg-gray-50 p-4 flex items-center justify-between border-b border-gray-100 group">
                                                    <div className="flex items-center gap-4">
                                                        <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab hover:text-gray-600">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h2 className="text-xl font-bold text-gray-900">{stop.cityName || t('unknownCity')}</h2>
                                                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={14} />
                                                                    {stop.arrivalDate ? format(new Date(stop.arrivalDate), 'MMM d') : ''} - {stop.departureDate ? format(new Date(stop.departureDate), 'MMM d') : ''}
                                                                </span>
                                                                {stop.arrivalDate && stop.departureDate && (
                                                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                                                                        {getDuration(stop.arrivalDate, stop.departureDate)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setCurrentStop(stop); setIsStopModalOpen(true); }}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ type: 'STOP', id: stop.id })}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Activities List */}
                                                <div className="p-4 sm:p-6">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('activities')}</h4>
                                                        <button
                                                            onClick={() => { setCurrentStop(stop); setCurrentActivity(null); setIsActivityModalOpen(true); }}
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                        >
                                                            <PlusCircle size={16} />
                                                            {t('addActivity')}
                                                        </button>
                                                    </div>

                                                    <Droppable droppableId={stop.id} type="ACTIVITY">
                                                        {(provided) => (
                                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 min-h-[50px]">
                                                                {stop.activities && stop.activities.map((activity, actIndex) => (
                                                                    <Draggable key={activity.id} draggableId={String(activity.id)} index={actIndex}>
                                                                        {(provided) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group relative"
                                                                            >
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="flex gap-4">
                                                                                        <div className="mt-1 text-gray-300 cursor-grab px-1" {...provided.dragHandleProps}>
                                                                                            <GripVertical size={16} />
                                                                                        </div>
                                                                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                                                                            {getActivityIcon(activity.type)}
                                                                                        </div>
                                                                                        <div>
                                                                                            <h4 className="font-bold text-gray-900">{activity.name}</h4>
                                                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    <Clock size={14} />
                                                                                                    {activity.startTime ? format(new Date(`2000-01-01T${activity.startTime}`), 'h:mm a') : ''}
                                                                                                    {activity.endTime ? ` - ${format(new Date(`2000-01-01T${activity.endTime}`), 'h:mm a')}` : ''}
                                                                                                </span>
                                                                                                <span className="flex items-center gap-1">
                                                                                                    <DollarSign size={14} />
                                                                                                    {activity.cost || 0}
                                                                                                </span>
                                                                                                <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                                                                    {activity.type}
                                                                                                </span>
                                                                                            </div>
                                                                                            {activity.notes && (
                                                                                                <p className="text-xs text-gray-400 mt-2 line-clamp-1">{activity.notes}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                                                                                        <button
                                                                                            onClick={() => { setCurrentStop(stop); setCurrentActivity(activity); setIsActivityModalOpen(true); }}
                                                                                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-50"
                                                                                        >
                                                                                            <Edit2 size={14} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setDeleteConfirm({ type: 'ACTIVITY', id: activity.id, stopId: stop.id })}
                                                                                            className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-gray-50"
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                                {(!stop.activities || stop.activities.length === 0) && (
                                                                    <div
                                                                        onClick={() => { setCurrentStop(stop); setCurrentActivity(null); setIsActivityModalOpen(true); }}
                                                                        className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 text-sm hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors"
                                                                    >
                                                                        {t('clickToAddActivity')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Stop Modal */}
            {isStopModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <form onSubmit={handleSaveStop} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {currentStop ? t('editDestination') : t('addDestination')}
                                </h3>
                                <button type="button" onClick={() => setIsStopModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('cityName')}</label>
                                    <input
                                        type="text"
                                        name="cityName"
                                        defaultValue={currentStop?.cityName}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('searchCityPlaceholder')}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('arrival')}</label>
                                        <input
                                            type="date"
                                            name="arrivalDate"
                                            defaultValue={currentStop?.arrivalDate}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('departure')}</label>
                                        <input
                                            type="date"
                                            name="departureDate"
                                            defaultValue={currentStop?.departureDate}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('transport')}</label>
                                    <select
                                        name="transportMode"
                                        defaultValue={currentStop?.transportMode || 'Flight'}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Flight">Flight</option>
                                        <option value="Train">Train</option>
                                        <option value="Bus">Bus</option>
                                        <option value="Car">Car</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStopModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    {currentStop ? t('updateDestination') : t('addDestination')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {isActivityModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <form onSubmit={handleSaveActivity} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {currentActivity ? t('editActivity') : t('addNewActivity')}
                                </h3>
                                <button type="button" onClick={() => setIsActivityModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('activityName')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={currentActivity?.name}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('type')}</label>
                                        <select
                                            name="type"
                                            defaultValue={currentActivity?.type || 'Sightseeing'}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Sightseeing">Sightseeing</option>
                                            <option value="Food">Food</option>
                                            <option value="Adventure">Adventure</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Relaxation">Relaxation</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('cost')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="cost"
                                                min="0"
                                                defaultValue={currentActivity?.cost || 0}
                                                className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('startTime')}</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            defaultValue={currentActivity?.startTime}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('endTime')}</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            defaultValue={currentActivity?.endTime}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('notesOptional')}</label>
                                    <textarea
                                        name="notes"
                                        rows="3"
                                        defaultValue={currentActivity?.notes}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsActivityModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    {t('saveActivity')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {deleteConfirm.id && (
                <ConfirmationModal
                    title={deleteConfirm.type === 'STOP' ? t('removeDestinationQuestion') : t('deleteActivityQuestion')}
                    message={deleteConfirm.type === 'STOP' ? t('removeDestinationConfirm') : t('deleteActivityConfirm')}
                    onClose={() => setDeleteConfirm({ type: null, id: null })}
                    onConfirm={deleteConfirm.type === 'STOP' ? handleDeleteStop : handleDeleteActivity}
                    isDangerous={true}
                />
            )}
        </div>
    );
};

// Activity Icon Helper
const getActivityIcon = (type) => {
    switch (type) {
        case 'Food': return <span className="text-2xl">🍽️</span>;
        case 'Adventure': return <span className="text-2xl">🧗</span>;
        case 'Shopping': return <span className="text-2xl">🛍️</span>;
        case 'Relaxation': return <span className="text-2xl">🧖</span>;
        case 'Sightseeing':
        default: return <span className="text-2xl">📸</span>;
    }
};

export default ItineraryView;