import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, isToday, isSameDay } from 'date-fns';
import { AlertTriangle, Plus } from 'lucide-react';
import DraggableActivity from './DraggableActivity';

const DroppableDay = ({ date, activities, isCurrentMonth, isTripDay }) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    const { setNodeRef, isOver } = useDroppable({
        id: dateStr,
        data: { date: dateStr, isTripDay },
        disabled: !isTripDay
    });

    const isTodayDate = isToday(date);

    // Sort and detect conflicts
    const sortedActivities = [...activities].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const getMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    return (
        <div
            ref={setNodeRef}
            className={`
                min-h-[140px] p-2 border transition-all flex flex-col gap-1.5 relative overflow-hidden group
                ${!isTripDay
                    ? 'bg-gray-100/50 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/30'
                }
                ${isCurrentMonth && isTripDay ? 'opacity-100 border-gray-200' : 'opacity-40 border-gray-100'}
                ${isOver && isTripDay ? 'bg-gradient-to-br from-blue-100 to-purple-100 ring-2 ring-inset ring-blue-400 scale-[1.02] z-10 shadow-xl' : ''}
                ${isTodayDate ? 'ring-2 ring-inset ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md' : ''}
            `}
        >
            {/* Background Pattern for Non-Trip Days */}
            {!isTripDay && (
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(0,0,0,0.03)_49%,rgba(0,0,0,0.03)_51%,transparent_52%)] bg-[length:12px_12px]"></div>
                </div>
            )}

            <div className="flex justify-between items-start mb-1 relative z-10">
                <span className={`
                    text-xs font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all
                    ${isTodayDate 
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110 ring-2 ring-blue-200' 
                        : isTripDay 
                        ? 'text-gray-900 bg-gradient-to-br from-gray-100 to-gray-50 hover:shadow-md' 
                        : 'text-gray-400 bg-gray-50'}
                `}>
                    {format(date, 'd')}
                </span>

                {isTripDay && activities.length > 0 && (
                    <div className="flex gap-1 items-center">
                        <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                            {activities.length}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-grow space-y-1.5 relative z-10">
                {sortedActivities.map((act, idx) => {
                    let hasConflict = false;
                    if (idx > 0) {
                        const prev = sortedActivities[idx - 1];
                        const prevEnd = getMinutes(prev.endTime);
                        const currStart = getMinutes(act.startTime);
                        if (prev.endTime && act.startTime && currStart < prevEnd) {
                            hasConflict = true;
                        }
                    }

                    return (
                        <div key={`${act.id}-${dateStr}`} className="relative group/item">
                            {hasConflict && (
                                <div 
                                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 z-20 animate-pulse" 
                                    title="Time Conflict Detected"
                                >
                                    <div className="bg-red-500 text-white rounded-full p-0.5 shadow-lg">
                                        <AlertTriangle size={10} />
                                    </div>
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

            {/* Hover Add Indicator */}
            {isTripDay && activities.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg">
                        <Plus size={16} />
                    </div>
                </div>
            )}

            {/* Drop Zone Indicator */}
            {isOver && isTripDay && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg animate-bounce">
                        Drop here
                    </div>
                </div>
            )}
        </div>
    );
};

export default DroppableDay;