import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTrip } from '../../context/TripContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, addMonths, subMonths,
    parseISO, addDays, differenceInDays, isWithinInterval, startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay } from '@dnd-kit/core';

import DroppableDay from './calendar/DroppableDay';
import DraggableActivity from './calendar/DraggableActivity';

const CalendarGrid = () => {
    const { trip, updateActivity } = useTrip();
    const { t } = useLanguage();

    // Initialize to Trip Start Date preferably, or Today
    const initialDate = useMemo(() => {
        if (trip?.startDate) return parseISO(trip.startDate);
        return new Date();
    }, [trip?.startDate]);

    const [currentMonth, setCurrentMonth] = useState(initialDate);
    const [activeId, setActiveId] = useState(null);
    const [dragError, setDragError] = useState(null); // For simplified "invalid drop" feedback (optional UI)

    // Sensors
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

    // Navigation
    const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calendar Range
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    // Trip Range Interval
    const tripInterval = useMemo(() => {
        if (!trip.startDate || !trip.endDate) return null;
        return {
            start: startOfDay(parseISO(trip.startDate)),
            end: startOfDay(parseISO(trip.endDate))
        };
    }, [trip]);

    // Flatten Activities
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

    // Overlay Item
    const activeActivity = useMemo(() => {
        return allActivities.find(act => act.id.toString() === activeId);
    }, [activeId, allActivities]);

    // Handlers
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        setDragError(null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return; // Dropped outside

        const newDateStr = over.id;
        const activityId = active.id;
        const activity = allActivities.find(a => a.id.toString() === activityId.toString());

        if (!activity) return;
        if (activity.date === newDateStr) return; // No change

        // Validation: Is dropped date a valid trip day?
        // Note: The Droppable is disabled if not simple, but we double check logic here
        const droppedDate = parseISO(newDateStr);
        if (tripInterval && !isWithinInterval(droppedDate, tripInterval)) {
            // Should be blocked by UI, but safety check
            console.warn("Drop rejected: Day out of trip range.");
            return;
        }

        // Calculate new Offset
        const arrivalDate = activity.stopArrivalDate;
        const newDayOffset = differenceInDays(droppedDate, arrivalDate);

        // Optimistic / Backend Update
        // Fix: Send FULL payload to prevent backend from wiping out missing fields (like startTime)
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

        await updateActivity(activity.id, payload);
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden select-none animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={onPrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600"><ChevronLeft size={20} /></button>
                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <CalendarIcon size={20} className="text-blue-500" />
                            {format(currentMonth, "MMMM yyyy")}
                        </h2>
                        <button onClick={onNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600"><ChevronRight size={20} /></button>
                    </div>

                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-3 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white border border-gray-300"></span> {t('day')}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-100 border border-gray-200 bg-[linear-gradient(45deg,transparent_25%,#00000010_25%,#00000010_50%,transparent_50%)] bg-[length:4px_4px]"></span> {t('other')}</div>
                    </div>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 bg-white border-b border-gray-100 text-center py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm z-10 relative">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-gray-50">
                    {calendarDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayActs = allActivities.filter(a => a.date === dateStr);

                        // Check if this day is part of the Trip
                        let isTripDay = false;
                        if (tripInterval) {
                            // Using startOfDay to ignore time components
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

                {/* Drag Overlay Item (Visual Only) */}
                <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                    {activeActivity ? (
                        <div className="w-[140px] opacity-90 rotate-2 scale-105 cursor-grabbing z-50">
                            {/* Re-using Draggable UI but making it look 'lifted' */}
                            <div className="py-2 px-3 rounded shadow-xl bg-white border-l-[3px] border-blue-500 ring-2 ring-blue-500/20">
                                <div className="font-bold text-sm text-gray-900 leading-tight">{activeActivity.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>
                                        {activeActivity.startTime}
                                        {activeActivity.endTime ? ` - ${activeActivity.endTime}` : ''}
                                    </span>
                                    {activeActivity.cost > 0 && <span>{formatCurrency(activeActivity.cost)}</span>}
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