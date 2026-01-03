import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTrip } from '../../context/TripContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, addMonths, subMonths,
    parseISO, addDays, differenceInDays, isWithinInterval, startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay } from '@dnd-kit/core';
import { toast } from 'react-toastify';

import DroppableDay from './calendar/DroppableDay';
import DraggableActivity from './calendar/DraggableActivity';

const CalendarGrid = () => {
    const { trip, updateActivity } = useTrip();
    const { t } = useLanguage();

    const initialDate = useMemo(() => {
        if (trip?.startDate) return parseISO(trip.startDate);
        return new Date();
    }, [trip?.startDate]);

    const [currentMonth, setCurrentMonth] = useState(initialDate);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    useEffect(() => {
        if (trip?.startDate) {
            setCurrentMonth(parseISO(trip.startDate));
        }
    }, [trip?.startDate]);

    if (!trip) return null;

    const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const tripInterval = useMemo(() => {
        if (!trip.startDate || !trip.endDate) return null;
        return {
            start: startOfDay(parseISO(trip.startDate)),
            end: startOfDay(parseISO(trip.endDate))
        };
    }, [trip]);

    const allActivities = useMemo(() => {
        return trip.stops?.flatMap(stop =>
            stop.activities?.map(act => {
                const arrivalDate = parseISO(stop.arrivalDate);
                const actDateStr = act.dayOffset !== undefined
                    ? format(addDays(arrivalDate, act.dayOffset), 'yyyy-MM-dd')
                    : stop.arrivalDate;

                return {
                    ...act,
                    date: actDateStr,
                    stopId: stop.id,
                    stopArrivalDate: arrivalDate,
                };
            }) || []
        ) || [];
    }, [trip]);

    const activeActivity = useMemo(() => {
        return allActivities.find(act => act.id.toString() === activeId);
    }, [activeId, allActivities]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            toast.info('Activity not moved', {
                position: 'bottom-center',
                autoClose: 2000
            });
            return;
        }

        const newDateStr = over.id;
        const activityId = active.id;
        const activity = allActivities.find(a => a.id.toString() === activityId.toString());

        if (!activity) return;
        if (activity.date === newDateStr) return;

        const droppedDate = parseISO(newDateStr);
        if (tripInterval && !isWithinInterval(droppedDate, tripInterval)) {
            toast.error('Cannot move activity outside trip dates', {
                position: 'bottom-center',
                autoClose: 3000
            });
            return;
        }

        const arrivalDate = activity.stopArrivalDate;
        const newDayOffset = differenceInDays(droppedDate, arrivalDate);

        const payload = {
            name: activity.name,
            cost: activity.cost,
            category: activity.category,
            startTime: activity.startTime,
            endTime: activity.endTime,
            description: activity.description,
            durationMinutes: activity.durationMinutes,
            dayOffset: newDayOffset
        };

        try {
            await updateActivity(activity.id, payload);
            toast.success('Activity moved successfully!', {
                position: 'bottom-center',
                autoClose: 2000
            });
        } catch (error) {
            toast.error('Failed to move activity', {
                position: 'bottom-center',
                autoClose: 3000
            });
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden select-none animate-fadeIn">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm sticky top-0 z-20 gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onPrevMonth} 
                            className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-600 hover:text-blue-600 hover:scale-110 active:scale-95"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Calendar size={20} className="text-white" />
                            </div>
                            {format(currentMonth, "MMMM yyyy")}
                        </h2>
                        <button 
                            onClick={onNextMonth} 
                            className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-600 hover:text-blue-600 hover:scale-110 active:scale-95"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-white border-2 border-blue-400 shadow-sm"></span> 
                            <span>Trip Day</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-200 border-2 border-gray-300"></span> 
                            <span>Other</span>
                        </div>
                    </div>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-center py-4 text-xs font-bold text-gray-600 uppercase tracking-widest shadow-sm z-10 relative">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <div key={day} className={`${idx === 0 || idx === 6 ? 'text-blue-600' : ''}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-[600px]">
                    {calendarDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayActs = allActivities.filter(a => a.date === dateStr);

                        let isTripDay = false;
                        if (tripInterval) {
                            isTripDay = isWithinInterval(startOfDay(day), tripInterval);
                        }

                        return (
                            <DroppableDay
                                key={dateStr}
                                date={day}
                                activities={dayActs}
                                isCurrentMonth={isSameMonth(day, monthStart)}
                                isTripDay={isTripDay}
                            />
                        );
                    })}
                </div>

                {/* Drag Overlay */}
                <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                    {activeActivity ? (
                        <div className="w-[160px] opacity-95 rotate-3 scale-110 cursor-grabbing z-50 animate-pulse">
                            <div className="py-3 px-4 rounded-xl shadow-2xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-500 ring-4 ring-blue-500/30">
                                <div className="font-bold text-sm text-gray-900 leading-tight mb-2">{activeActivity.name}</div>
                                <div className="text-xs text-gray-600 flex justify-between items-center">
                                    <span className="flex items-center gap-1">
                                        ⏰ {activeActivity.startTime}
                                        {activeActivity.endTime ? ` - ${activeActivity.endTime}` : ''}
                                    </span>
                                    {activeActivity.cost > 0 && (
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(activeActivity.cost)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default CalendarGrid;