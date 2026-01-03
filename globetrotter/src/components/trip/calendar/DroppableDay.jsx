import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, isToday, isSameDay } from 'date-fns';
import DraggableActivity from './DraggableActivity';

const DroppableDay = ({ date, activities, isCurrentMonth, isTripDay }) => {
    // Unique ID for the day using date string
    const dateStr = format(date, 'yyyy-MM-dd');

    // ONLY enable dropping if it is a valid trip day
    const { setNodeRef, isOver } = useDroppable({
        id: dateStr,
        data: { date: dateStr, isTripDay },
        disabled: !isTripDay
    });

    const isTodayDate = isToday(date);

    // Conflict Detection
    const sortedActivities = [...activities].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    // Simple helper to convert "HH:mm" to minutes
    const getMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    return (
        <div
            ref={setNodeRef}
            className={`
                min-h-[120px] p-2 border border-gray-100 transition-all flex flex-col gap-1 relative overflow-hidden group
                ${!isTripDay
                    ? 'bg-gray-50/80 text-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-white hover:bg-slate-50'
                }
                ${isCurrentMonth && isTripDay ? 'opacity-100' : 'opacity-50'}
                ${isOver && isTripDay ? 'bg-blue-50 ring-2 ring-inset ring-blue-300 scale-[1.02] z-10 shadow-lg' : ''}
                ${isTodayDate ? 'ring-1 ring-inset ring-blue-200 bg-blue-50/30' : ''}
            `}
        >
            {/* Background Stripe for Non-Trip Days */}
            {!isTripDay && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_25%,rgba(0,0,0,0.02)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.02)_75%,rgba(0,0,0,0.02)_100%)] bg-[length:10px_10px]"></div>
            )}

            <div className="flex justify-between items-start mb-1 relative z-10">
                <span className={`
                    text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors
                    ${isTodayDate ? 'bg-blue-600 text-white shadow-md' : isTripDay ? 'text-gray-900 bg-gray-100' : 'text-gray-400'}
                `}>
                    {format(date, 'd')}
                </span>

                {isTripDay && (
                    <div className="flex gap-1">
                        {activities.length > 0 && (
                            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500 font-medium">
                                {activities.length}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-grow space-y-1 relative z-10">
                {sortedActivities.map((act, idx) => {
                    // Check for conflict with PREVIOUS activity
                    let hasConflict = false;
                    if (idx > 0) {
                        const prev = sortedActivities[idx - 1];
                        const prevEnd = getMinutes(prev.endTime);
                        const currStart = getMinutes(act.startTime);
                        // If they overlap (and user actually set times)
                        if (prev.endTime && act.startTime && currStart < prevEnd) {
                            hasConflict = true;
                        }
                    }

                    return (
                        <div key={`${act.id}-${dateStr}`} className="relative group/item">
                            {hasConflict && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-red-500 z-20" title="Time Conflict">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="12" y1="19" x2="12.01" y2="19"></line>
                                    </svg>
                                </div>
                            )}
                            <DraggableActivity
                                id={`${act.id}`}
                                activity={act}
                            />
                        </div>
                    );
                })}
            </div>

            {/* "Add" hint on hover for Trip Days */}
            {/* {isTripDay && (
                <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">
                        +
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default DroppableDay;