import React from 'react';
import { formatCurrency } from '../../../utils/currency';
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const BudgetHeader = ({ budgetStats }) => {
    const { totalBudget, totalSpent, remaining, isOverBudget } = budgetStats || { totalBudget: 0, totalSpent: 0, remaining: 0, isOverBudget: false };
    const { t } = useLanguage();

    const percentUsed = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Budget Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                    <DollarSign size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{t('totalBudget')}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</h3>
                </div>
            </div>

            {/* Total Spent Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                <div className={`p-4 rounded-full ${isOverBudget ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{t('totalExpenses')}</p>
                    <h3 className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(totalSpent)}
                    </h3>
                </div>
            </div>

            {/* Remaining Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1 bg-gray-100"></div>
                <div className="absolute right-0 bottom-0 top-0 w-1 bg-blue-500 transition-all duration-1000" style={{ height: `${percentUsed}%`, opacity: 0.1 }}></div>

                <div className="p-4 bg-purple-50 text-purple-600 rounded-full z-10">
                    <PieChart size={24} />
                </div>
                <div className="z-10">
                    <p className="text-sm text-gray-500 font-medium">{t('remaining')}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(remaining)}</h3>
                </div>
                {isOverBudget && (
                    <div className="absolute top-4 right-4 text-red-500 animate-pulse" title="Over Budget!">
                        <AlertCircle size={20} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetHeader;