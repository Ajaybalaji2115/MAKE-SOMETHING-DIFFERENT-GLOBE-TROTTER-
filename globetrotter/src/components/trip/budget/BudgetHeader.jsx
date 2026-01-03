import React from 'react';
import { formatCurrency } from '../../../utils/currency';
import { DollarSign, TrendingUp, PieChart, AlertCircle, TrendingDown, Wallet } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const BudgetHeader = ({ budgetStats }) => {
    const { totalBudget, totalSpent, remaining, isOverBudget } = budgetStats || { 
        totalBudget: 0, 
        totalSpent: 0, 
        remaining: 0, 
        isOverBudget: false 
    };
    const { t } = useLanguage();

    const percentUsed = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Budget Card */}
            <div className="group bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent opacity-50 rounded-full -mr-16 -mt-16"></div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform relative z-10">
                    <Wallet size={28} />
                </div>
                <div className="relative z-10">
                    <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                        Total Budget
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(totalBudget)}</h3>
                </div>
            </div>

            {/* Total Spent Card */}
            <div className={`group bg-white rounded-2xl shadow-md border-2 p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden relative ${
                isOverBudget ? 'border-red-200' : 'border-green-200'
            }`}>
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-50 rounded-full -mr-16 -mt-16 ${
                    isOverBudget ? 'bg-gradient-to-br from-red-100 to-transparent' : 'bg-gradient-to-br from-green-100 to-transparent'
                }`}></div>
                <div className={`p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform relative z-10 ${
                    isOverBudget 
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' 
                        : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                }`}>
                    {isOverBudget ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
                </div>
                <div className="relative z-10">
                    <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                        Total Expenses
                        {isOverBudget && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                                Over!
                            </span>
                        )}
                    </p>
                    <h3 className={`text-3xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(totalSpent)}
                    </h3>
                </div>
            </div>

            {/* Remaining Card */}
            <div className="group bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden relative">
                {/* Progress Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent"></div>
                <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-100/50 to-transparent transition-all duration-1000" 
                    style={{ height: `${percentUsed}%` }}
                ></div>

                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform relative z-10">
                    <PieChart size={28} />
                </div>
                <div className="relative z-10 flex-1">
                    <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                        Remaining
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(remaining)}</h3>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 rounded-full ${
                                isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, percentUsed)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                        {percentUsed.toFixed(1)}% of budget used
                    </p>
                </div>
                {isOverBudget && (
                    <div className="absolute top-4 right-4 text-red-500 animate-bounce z-20" title="Over Budget!">
                        <div className="bg-red-100 rounded-full p-2 shadow-lg">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetHeader;