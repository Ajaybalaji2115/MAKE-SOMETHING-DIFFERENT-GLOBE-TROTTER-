import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    PlusCircle, MapPin, Calendar, GripVertical, Trash2, Edit2,
    Clock, DollarSign, X, Plane, Train, Bus, Car,
    Check, AlertCircle, Sparkles, MapPinned
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../lib/axios';

const ConfirmationModal = ({ title, message, onClose, onConfirm, isDangerous = false }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scaleIn">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDangerous ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <AlertCircle className={isDangerous ? 'text-red-600' : 'text-blue-600'} size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6 ml-15">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105 active:scale-95 ${isDangerous
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const ItineraryView = ({ trip, onUpdate }) => {
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
            try {
                await api.put(`/trips/${trip.id}/stops/reorder`, { stops: newStops });
                onUpdate();
                toast.success('Destinations reordered successfully!', {
                    icon: <Check className="text-green-500" />
                });
            } catch (err) {
                console.error("Failed to reorder stops", err);
                toast.error('Failed to reorder destinations');
            }
        } else if (type === 'ACTIVITY') {
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
                toast.success('Activities reordered successfully!');
            } catch (err) {
                console.error("Failed to reorder activities", err);
                toast.error('Failed to reorder activities');
            }
        }
    };

    const handleDeleteStop = async () => {
        if (!deleteConfirm.id) return;
        try {
            await api.delete(`/trips/${trip.id}/stops/${deleteConfirm.id}`);
            onUpdate();
            setDeleteConfirm({ type: null, id: null });
            toast.success('Destination removed successfully!');
        } catch (err) {
            console.error("Failed to delete stop", err);
            toast.error('Failed to remove destination');
        }
    };

    const handleDeleteActivity = async () => {
        if (!deleteConfirm.id || !deleteConfirm.stopId) return;
        try {
            await api.delete(`/trips/${trip.id}/stops/${deleteConfirm.stopId}/activities/${deleteConfirm.id}`);
            onUpdate();
            setDeleteConfirm({ type: null, id: null });
            toast.success('Activity deleted successfully!');
        } catch (err) {
            console.error("Failed to delete activity", err);
            toast.error('Failed to delete activity');
        }
    };

    const handleSaveStop = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const stopData = Object.fromEntries(formData.entries());

        try {
            if (currentStop?.id) {
                await api.put(`/trips/${trip.id}/stops/${currentStop.id}`, stopData);
                toast.success('Destination updated successfully!');
            } else {
                await api.post(`/trips/${trip.id}/stops`, stopData);
                toast.success('Destination added successfully!');
            }
            onUpdate();
            setIsStopModalOpen(false);
            setCurrentStop(null);
        } catch (err) {
            console.error("Failed to save stop", err);
            toast.error('Failed to save destination');
        }
    };

    const handleSaveActivity = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const activityData = Object.fromEntries(formData.entries());

        if (activityData.cost) activityData.cost = parseFloat(activityData.cost);

        try {
            if (currentActivity?.id) {
                await api.put(`/trips/${trip.id}/stops/${currentStop.id}/activities/${currentActivity.id}`, activityData);
                toast.success('Activity updated successfully!');
            } else {
                await api.post(`/trips/${trip.id}/stops/${currentStop.id}/activities`, activityData);
                toast.success('Activity added successfully!');
            }
            onUpdate();
            setIsActivityModalOpen(false);
            setCurrentActivity(null);
            setCurrentStop(null);
        } catch (err) {
            console.error("Failed to save activity", err);
            toast.error('Failed to save activity');
        }
    };

    const getDuration = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    };

    const getTransportIcon = (mode) => {
        switch (mode) {
            case 'Flight': return <Plane size={16} />;
            case 'Train': return <Train size={16} />;
            case 'Bus': return <Bus size={16} />;
            case 'Car': return <Car size={16} />;
            default: return <MapPin size={16} />;
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            'Food': '🍽️',
            'Adventure': '🧗',
            'Shopping': '🛍️',
            'Relaxation': '🧖',
            'Sightseeing': '📸'
        };
        return icons[type] || '📸';
    };

    if (!trip) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <MapPinned className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg">No itinerary data available</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Sparkles className="text-blue-600" size={32} />
                        Your Itinerary
                    </h2>
                    <p className="text-gray-500 mt-2">Plan and organize your journey</p>
                </div>
                <button
                    onClick={() => { setCurrentStop(null); setIsStopModalOpen(true); }}
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 font-medium hover:scale-105 active:scale-95"
                >
                    <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                    Add Destination
                </button>
            </div>

            {stops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-dashed border-blue-200 animate-fadeIn">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full mb-6 shadow-lg">
                        <MapPin size={48} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Journey</h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">You haven't added any destinations yet. Click the button above to begin planning!</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="stops" type="STOP">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`space-y-6 transition-all ${snapshot.isDraggingOver ? 'opacity-50' : ''}`}
                            >
                                {stops.map((stop, index) => (
                                    <Draggable key={stop.id} draggableId={String(stop.id)} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-xl ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2' : ''
                                                    }`}
                                            >
                                                {/* Stop Header */}
                                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 flex items-center justify-between border-b border-gray-100 group">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-blue-600 transition-colors p-2 hover:bg-white rounded-lg"
                                                        >
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                                <MapPin size={20} className="text-blue-500" />
                                                                {stop.cityName || 'Unknown City'}
                                                            </h2>
                                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                                                                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg">
                                                                    <Calendar size={14} className="text-blue-500" />
                                                                    {stop.arrivalDate ? format(new Date(stop.arrivalDate), 'MMM d') : ''} - {stop.departureDate ? format(new Date(stop.departureDate), 'MMM d') : ''}
                                                                </span>
                                                                {stop.arrivalDate && stop.departureDate && (
                                                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm">
                                                                        {getDuration(stop.arrivalDate, stop.departureDate)}
                                                                    </span>
                                                                )}
                                                                {stop.transportMode && (
                                                                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg">
                                                                        {getTransportIcon(stop.transportMode)}
                                                                        <span className="text-xs font-medium">{stop.transportMode}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => { setCurrentStop(stop); setIsStopModalOpen(true); }}
                                                            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ type: 'STOP', id: stop.id })}
                                                            className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Activities List */}
                                                <div className="p-6">
                                                    <div className="flex justify-between items-center mb-5">
                                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                                            Activities
                                                        </h4>
                                                        <button
                                                            onClick={() => { setCurrentStop(stop); setCurrentActivity(null); setIsActivityModalOpen(true); }}
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 hover:gap-2 transition-all group"
                                                        >
                                                            <PlusCircle size={16} className="group-hover:rotate-90 transition-transform" />
                                                            Add Activity
                                                        </button>
                                                    </div>

                                                    <Droppable droppableId={stop.id} type="ACTIVITY">
                                                        {(provided) => (
                                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 min-h-[50px]">
                                                                {stop.activities && stop.activities.map((activity, actIndex) => (
                                                                    <Draggable key={activity.id} draggableId={String(activity.id)} index={actIndex}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className={`bg-gradient-to-r from-white to-gray-50 border-l-4 border-blue-400 rounded-xl p-4 hover:shadow-lg transition-all group relative ${snapshot.isDragging ? 'shadow-2xl scale-105' : ''
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="flex gap-4 flex-1">
                                                                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0 shadow-sm text-2xl">
                                                                                            {getActivityIcon(activity.type)}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <h4 className="font-bold text-gray-900 text-base mb-2">{activity.name}</h4>
                                                                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                                                                {(activity.startTime || activity.endTime) && (
                                                                                                    <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                                                                                                        <Clock size={14} className="text-blue-500" />
                                                                                                        {activity.startTime ? format(new Date(`2000-01-01T${activity.startTime}`), 'h:mm a') : ''}
                                                                                                        {activity.endTime ? ` - ${format(new Date(`2000-01-01T${activity.endTime}`), 'h:mm a')}` : ''}
                                                                                                    </span>
                                                                                                )}
                                                                                                {activity.cost > 0 && (
                                                                                                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-200 font-medium">
                                                                                                        <DollarSign size={14} />
                                                                                                        {activity.cost}
                                                                                                    </span>
                                                                                                )}
                                                                                                <span className="capitalize px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                                                                                                    {activity.type}
                                                                                                </span>
                                                                                            </div>
                                                                                            {activity.notes && (
                                                                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">{activity.notes}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="bg-white shadow-md border border-gray-200 rounded-xl p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all absolute right-4 top-4">
                                                                                        <button
                                                                                            onClick={() => { setCurrentStop(stop); setCurrentActivity(activity); setIsActivityModalOpen(true); }}
                                                                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                                                                                        >
                                                                                            <Edit2 size={16} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setDeleteConfirm({ type: 'ACTIVITY', id: activity.id, stopId: stop.id })}
                                                                                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                                                                        >
                                                                                            <Trash2 size={16} />
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
                                                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                                                                    >
                                                                        <PlusCircle className="mx-auto mb-2 group-hover:scale-110 transition-transform" size={32} />
                                                                        <p className="font-medium">Click to add your first activity</p>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <form onSubmit={handleSaveStop} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <MapPin className="text-white" size={20} />
                                    </div>
                                    {currentStop ? 'Edit Destination' : 'Add Destination'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsStopModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500" />
                                        City Name
                                    </label>
                                    <input
                                        type="text"
                                        name="cityName"
                                        defaultValue={currentStop?.cityName}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="e.g., Paris, Tokyo, New York"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Calendar size={16} className="text-green-500" />
                                            Arrival
                                        </label>
                                        <input
                                            type="date"
                                            name="arrivalDate"
                                            defaultValue={currentStop?.arrivalDate}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Calendar size={16} className="text-red-500" />
                                            Departure
                                        </label>
                                        <input
                                            type="date"
                                            name="departureDate"
                                            defaultValue={currentStop?.departureDate}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Plane size={16} className="text-purple-500" />
                                        Transport Mode
                                    </label>
                                    <select
                                        name="transportMode"
                                        defaultValue={currentStop?.transportMode || 'Flight'}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                                    >
                                        <option value="Flight">✈️ Flight</option>
                                        <option value="Train">🚆 Train</option>
                                        <option value="Bus">🚌 Bus</option>
                                        <option value="Car">🚗 Car</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStopModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    {currentStop ? 'Update' : 'Add'} Destination
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {isActivityModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <form onSubmit={handleSaveActivity} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-xl">
                                        ✨
                                    </div>
                                    {currentActivity ? 'Edit Activity' : 'Add New Activity'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsActivityModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Activity Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={currentActivity?.name}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="e.g., Visit Eiffel Tower"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                        <select
                                            name="type"
                                            defaultValue={currentActivity?.type || 'Sightseeing'}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                                        >
                                            <option value="Sightseeing">📸 Sightseeing</option>
                                            <option value="Food">🍽️ Food</option>
                                            <option value="Adventure">🧗 Adventure</option>
                                            <option value="Shopping">🛍️ Shopping</option>
                                            <option value="Relaxation">🧖 Relaxation</option>
                                            <option value="Other">✨ Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <DollarSign size={16} className="text-green-500" />
                                            Cost
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                                            <input
                                                type="number"
                                                name="cost"
                                                min="0"
                                                step="0.01"
                                                defaultValue={currentActivity?.cost || 0}
                                                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Clock size={16} className="text-blue-500" />
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            defaultValue={currentActivity?.startTime}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Clock size={16} className="text-red-500" />
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            defaultValue={currentActivity?.endTime}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                                    <textarea
                                        name="notes"
                                        rows="3"
                                        defaultValue={currentActivity?.notes}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                        placeholder="Add any additional details..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsActivityModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    Save Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {deleteConfirm.id && (
                <ConfirmationModal
                    title={deleteConfirm.type === 'STOP' ? 'Remove Destination?' : 'Delete Activity?'}
                    message={deleteConfirm.type === 'STOP' ? 'This will remove the destination and all its activities. This action cannot be undone.' : 'Are you sure you want to delete this activity? This action cannot be undone.'}
                    onClose={() => setDeleteConfirm({ type: null, id: null })}
                    onConfirm={deleteConfirm.type === 'STOP' ? handleDeleteStop : handleDeleteActivity}
                    isDangerous={true}
                />
            )}
        </div>
    );
};

export default ItineraryView;