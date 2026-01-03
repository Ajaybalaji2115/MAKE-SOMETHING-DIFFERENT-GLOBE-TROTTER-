import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { formatCurrency } from '../../../utils/currency';

const DraggableActivity = ({ activity }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: activity.id.toString(),
        data: activity
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: 'relative',
        opacity: 0.8,
        rotate: '3deg'
    } : undefined;

    // Helper to determine color based on category
    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'food': return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100';
            case 'sightseeing': return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
            case 'adventure': return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100';
            case 'relaxation': return 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100';
            case 'transport': return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100';
            default: return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100';
        }
    };

    const colorClass = getCategoryColor(activity.category);

    // If dragging, we can render a placeholder or the actual item. 
    // Usually we keep the item in the list but maybe transparent?
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                className={`p-2 rounded-md border border-dashed border-gray-300 bg-gray-50 opacity-40 text-xs h-[50px]`}
            >
                {/* Placeholder space */}
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
                p-2 rounded-md border text-xs cursor-grab active:cursor-grabbing shadow-sm transition-all
                select-none hover:shadow-md
                ${colorClass}
            `}
        >
            <div className="font-semibold truncate leading-tight">{activity.name}</div>
            <div className="flex justify-between items-center mt-1 opacity-80 text-[10px]">
                <span>
                    {activity.startTime}
                    {activity.endTime ? ` - ${activity.endTime}` : ''}
                </span>
                {activity.cost > 0 && <span className="font-medium">{formatCurrency(activity.cost)}</span>}
            </div>
        </div>
    );
};

export default DraggableActivity;
