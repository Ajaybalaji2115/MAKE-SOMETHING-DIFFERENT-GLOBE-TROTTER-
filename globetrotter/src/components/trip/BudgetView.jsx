import React from 'react';
import { useTrip } from '../../context/TripContext';
import BudgetHeader from './budget/BudgetHeader';
import CostDistribution from './budget/CostDistribution';
import DailySpendChart from './budget/DailySpendChart';

const BudgetView = () => {
    const { trip, budgetStats } = useTrip();

    if (!trip) return null;

    return (
        <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-20">
            {/* Header Stats */}
            <BudgetHeader budgetStats={budgetStats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
                <CostDistribution trip={trip} />
                <DailySpendChart trip={trip} />
            </div>

            {/* Placeholder for future detailed table */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-lg mb-4">Detailed Expenses</h3>
                <p className="text-gray-500">Expense table coming soon...</p>
            </div> */}
        </div>
    );
};

export default BudgetView;