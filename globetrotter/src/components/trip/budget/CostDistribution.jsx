import React, { useMemo } from 'react';
import { formatCurrency } from '../../../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316'  // Orange
];

const CostDistribution = ({ trip }) => {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        if (!trip?.stops) return [];
        const data = {};

        trip.stops.forEach(stop => {
            if (stop.activities) {
                stop.activities.forEach(act => {
                    const cat = act.category || 'Other';
                    data[cat] = (data[cat] || 0) + (act.cost || 0);
                });
            }
            if (stop.transportCost && stop.transportCost > 0) {
                data['Transport'] = (data['Transport'] || 0) + stop.transportCost;
            }
        });

        return Object.keys(data)
            .map(key => ({ name: key, value: data[key] }))
            .sort((a, b) => b.value - a.value);
    }, [trip]);

    const total = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percentage = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="bg-white p-4 border-2 border-gray-200 shadow-xl rounded-xl text-sm">
                    <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: payload[0].payload.fill }}
                        ></span>
                        {payload[0].name}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                        {percentage}% of total budget
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for small slices

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="font-bold text-sm drop-shadow-lg"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col h-full hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <PieChartIcon size={20} className="text-white" />
                    </div>
                    Cost Distribution
                </h3>
                {total > 0 && (
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-semibold">Total</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-[300px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={CustomLabel}
                                innerRadius={70}
                                outerRadius={120}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={50}
                                iconType="circle"
                                iconSize={10}
                                wrapperStyle={{
                                    paddingTop: '20px',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <PieChartIcon size={40} className="text-gray-300" />
                        </div>
                        <span className="text-sm font-medium">No expense data yet</span>
                        <p className="text-xs text-gray-400 text-center max-w-xs">
                            Start adding activities with costs to see your spending distribution
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostDistribution;