import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { formatCurrency } from '../../../utils/currency';
import { GripVertical, DollarSign } from 'lucide-react';

const DraggableActivity = ({ activity }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: activity.id.toString(),
        data: activity
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: 'relative',
        opacity: 0.9,
    } : undefined;

    const getCategoryColor = (category) => {
        const colors = {
            'food': 'from-orange-400 to-orange-500 border-orange-300 shadow-orange-200',
            'sightseeing': 'from-blue-400 to-blue-500 border-blue-300 shadow-blue-200',
            'adventure': 'from-red-400 to-red-500 border-red-300 shadow-red-200',
            'relaxation': 'from-green-400 to-green-500 border-green-300 shadow-green-200',
            'transport': 'from-gray-400 to-gray-500 border-gray-300 shadow-gray-200',
            'shopping': 'from-pink-400 to-pink-500 border-pink-300 shadow-pink-200',
            'other': 'from-purple-400 to-purple-500 border-purple-300 shadow-purple-200'
        };
        return colors[category?.toLowerCase()] || colors['other'];
    };

    const getCategoryEmoji = (category) => {
        const emojis = {
            'food': '🍽️',
            'sightseeing': '📸',
            'adventure': '🧗',
            'relaxation': '🧖',
            'transport': '🚗',
            'shopping': '🛍️',
            'other': '✨'
        };
        return emojis[category?.toLowerCase()] || emojis['other'];
    };

    const colorClass = getCategoryColor(activity.category);

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                className="p-2.5 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 opacity-40 text-xs h-[60px] animate-pulse"
            >
                {/* Placeholder */}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                p-2.5 rounded-lg border-2 text-xs cursor-grab active:cursor-grabbing 
                shadow-md transition-all select-none
                bg-gradient-to-br ${colorClass}
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                group relative overflow-hidden
            `}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Drag Handle Indicator */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-30 transition-opacity">
                <GripVertical size={12} className="text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-start gap-1.5 mb-1">
                    <span className="text-base shrink-0">{getCategoryEmoji(activity.category)}</span>
                    <div className="font-bold text-white leading-tight line-clamp-2 flex-1">
                        {activity.name}
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-white/90 text-[10px] font-medium">
                    <span className="flex items-center gap-1 bg-black/10 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        ⏰ {activity.startTime || '--:--'}
                        {activity.endTime ? ` - ${activity.endTime}` : ''}
                    </span>
                    {activity.cost > 0 && (
                        <span className="flex items-center gap-0.5 bg-black/10 px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                            <DollarSign size={10} />
                            {activity.cost}
                        </span>
                    )}
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute -top-1 -left-1 w-8 h-8 bg-white/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};

export default DraggableActivity;