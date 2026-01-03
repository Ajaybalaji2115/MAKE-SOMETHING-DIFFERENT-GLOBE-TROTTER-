import React, { useMemo } from 'react';
import { formatCurrency } from '../../../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CostDistribution = ({ trip }) => {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        if (!trip?.stops) return [];
        const data = {};

        trip.stops.forEach(stop => {
            if (stop.activities) {
                stop.activities.forEach(act => {
                    const cat = act.category || 'Other';
                    data[cat] = (data[cat] || 0) + act.cost;
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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs">
                    <p className="font-bold mb-1">{t(payload[0].name.toLowerCase())}</p>
                    <p className="text-blue-600">
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
                <PieIcon size={20} className="text-blue-500" />
                {t('costDistribution')}
            </h3>

            <div className="flex-1 min-h-[300px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => t(value.toLowerCase())}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <PieIcon size={48} className="opacity-20" />
                        <span className="text-sm">{t('noDailyData')}</span> {/* Reuse noDailyData or noCostData if added */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostDistribution;