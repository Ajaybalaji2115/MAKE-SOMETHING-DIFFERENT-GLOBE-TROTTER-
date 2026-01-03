import React, { useMemo } from 'react';
import { formatCurrency } from '../../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useLanguage } from '../../../context/LanguageContext';

const DailySpendChart = ({ trip }) => {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        if (!trip?.stops) return [];

        // Map to hold date -> cost
        const dailyCosts = {};

        // Helper to add cost
        const addCost = (dateStr, cost) => {
            if (!dateStr || !isValid(parseISO(dateStr))) return;
            dailyCosts[dateStr] = (dailyCosts[dateStr] || 0) + cost;
        };

        trip.stops.forEach(stop => {
            // Distribute transport cost? Usually transport is on arrival date
            if (stop.transportCost && stop.arrivalDate) {
                addCost(stop.arrivalDate, stop.transportCost);
            }

            if (stop.activities) {
                stop.activities.forEach(act => {
                    // Calculate Activity Date based on Stop Arrival + Day Offset
                    // This logic must match the CalendarGrid logic
                    let actDate = stop.arrivalDate; // Default
                    if (act.dayOffset !== undefined && stop.arrivalDate) {
                        try {
                            // Simple date math if date-fns not available here for some reason, but we have it
                            // We'll rely on the backend/context generally providing a real date, 
                            // but here we only have what's in the 'trip' object. 
                            // Ideally backend should provide 'date' on activity, but if not:
                            const arrival = parseISO(stop.arrivalDate);
                            // Simple add days
                            const d = new Date(arrival);
                            d.setDate(d.getDate() + act.dayOffset);
                            actDate = format(d, 'yyyy-MM-dd');
                        } catch (e) {
                            console.error("Date error", e);
                        }
                    }

                    if (act.cost > 0) {
                        addCost(actDate, act.cost);
                    }
                });
            }
        });

        return Object.keys(dailyCosts)
            .map(date => ({ date, amount: dailyCosts[date] }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(item => ({
                ...item,
                displayDate: format(parseISO(item.date), 'MMM d')
            }));
    }, [trip]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs">
                    <p className="font-bold mb-1">{label}</p>
                    <p className="text-blue-600 font-bold">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
                <BarChart2 size={20} className="text-blue-500" />
                {t('dailySpending')}
            </h3>

            <div className="flex-1 min-h-[300px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickFormatter={(value) => `${value}`}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <BarChart2 size={48} className="opacity-20" />
                        <span className="text-sm">{t('noDailyData')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailySpendChart;