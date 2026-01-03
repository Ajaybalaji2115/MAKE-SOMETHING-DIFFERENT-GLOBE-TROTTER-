import React from 'react';
import { useTrip } from '../../context/TripContext';
import { Sparkles, TrendingUp } from 'lucide-react';
import BudgetHeader from './budget/BudgetHeader';
import CostDistribution from './budget/CostDistribution';
import DailySpendChart from './budget/DailySpendChart';

const BudgetView = () => {
    const { trip, budgetStats } = useTrip();

    if (!trip) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <TrendingUp className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg">No budget data available</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                    <Sparkles className="text-green-600" size={32} />
                    Budget Overview
                </h2>
                <p className="text-gray-500 mt-2">Track your expenses and manage your budget</p>
            </div>

            {/* Header Stats */}
            <BudgetHeader budgetStats={budgetStats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="h-[450px]">
                    <CostDistribution trip={trip} />
                </div>
                <div className="h-[450px]">
                    <DailySpendChart trip={trip} />
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Budget Tips</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Keep track of your daily expenses and activities. Update costs as you go to maintain an accurate budget. 
                            Set realistic budgets and leave some buffer for unexpected expenses during your trip.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetView;