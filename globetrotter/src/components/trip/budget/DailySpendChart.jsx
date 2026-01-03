import React, { useMemo } from 'react';
import { formatCurrency } from '../../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useLanguage } from '../../../context/LanguageContext';

const DailySpendChart = ({ trip }) => {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        if (!trip?.stops) return [];

        const dailyCosts = {};

        const addCost = (dateStr, cost) => {
            if (!dateStr || !isValid(parseISO(dateStr))) return;
            dailyCosts[dateStr] = (dailyCosts[dateStr] || 0) + cost;
        };

        trip.stops.forEach(stop => {
            if (stop.transportCost && stop.arrivalDate) {
                addCost(stop.arrivalDate, stop.transportCost);
            }

            if (stop.activities) {
                stop.activities.forEach(act => {
                    let actDate = stop.arrivalDate;
                    if (act.dayOffset !== undefined && stop.arrivalDate) {
                        try {
                            const arrival = parseISO(stop.arrivalDate);
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

    const maxSpend = useMemo(() => {
        return Math.max(...chartData.map(d => d.amount), 0);
    }, [chartData]);

    const avgSpend = useMemo(() => {
        if (chartData.length === 0) return 0;
        const total = chartData.reduce((sum, item) => sum + item.amount, 0);
        return total / chartData.length;
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isHighSpend = payload[0].value > avgSpend * 1.5;
            return (
                <div className="bg-white p-4 border-2 border-gray-200 shadow-xl rounded-xl text-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-blue-500" />
                        <p className="font-bold text-gray-900">{label}</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(payload[0].value)}
                    </p>
                    {isHighSpend && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium mt-2">
                            <TrendingUp size={12} />
                            High spending day
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col h-full hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart2 size={20} className="text-white" />
                    </div>
                    Daily Spending
                </h3>
                {chartData.length > 0 && (
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold">Avg/Day</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(avgSpend)}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-[300px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={chartData} 
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.7}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                vertical={false} 
                                stroke="#e5e7eb" 
                            />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                                tickFormatter={(value) => `$${value}`}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', opacity: 0.5 }} />
                            <Bar 
                                dataKey="amount" 
                                radius={[8, 8, 0, 0]} 
                                maxBarSize={60}
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {chartData.map((entry, index) => {
                                    const isHighSpend = entry.amount > avgSpend * 1.5;
                                    return (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={isHighSpend ? '#f59e0b' : 'url(#barGradient)'}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <BarChart2 size={40} className="text-gray-300" />
                        </div>
                        <span className="text-sm font-medium">No daily spending data</span>
                        <p className="text-xs text-gray-400 text-center max-w-xs">
                            Add activities with dates and costs to track your daily spending
                        </p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Peak Day</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(maxSpend)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Total Days</p>
                        <p className="text-lg font-bold text-blue-600">{chartData.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Average</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(avgSpend)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySpendChart;