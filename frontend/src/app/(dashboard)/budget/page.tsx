"use client";

import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

// --- Types ---
interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  total: number;
  status: 'Complete' | 'On Track' | 'Under Budget' | 'Over Budget';
}

// --- Mock Data ---
const budgetCategories: BudgetCategory[] = [
  { id: '1', name: 'Venue Rental', spent: 15000, total: 15000, status: 'Complete' },
  { id: '2', name: 'Catering', spent: 18500, total: 20000, status: 'On Track' },
  { id: '3', name: 'Marketing', spent: 6200, total: 8000, status: 'On Track' },
  { id: '4', name: 'Equipment', spent: 5500, total: 10000, status: 'Under Budget' },
];

// --- Helper Component for Status Badges ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Complete': 'bg-green-100 text-green-700',
    'On Track': 'bg-blue-100 text-blue-700',
    'Under Budget': 'bg-indigo-100 text-indigo-700',
    'Over Budget': 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
};

export default function BudgetPage() {
  // Calculate totals for the top cards
  const totalBudget = 60000;
  const totalSpent = 45200;
  const remaining = totalBudget - totalSpent;
  const percentageUsed = (totalSpent / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Budget Tracker</h2>
        <p className="text-gray-500 text-sm mt-1">Monitor event spending and allocations</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Budget */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Budget</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalBudget.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Spent</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Remaining */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Remaining</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">${remaining.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Main Budget Overview Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Budget Overview</h3>
        <p className="text-sm text-gray-500 mb-6">{percentageUsed.toFixed(1)}% of total budget used</p>

        {/* Main Progress Bar */}
        <div className="w-full bg-gray-100 h-3 rounded-full mb-10 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${percentageUsed}%` }}
          ></div>
        </div>

        {/* Individual Category Items */}
        <div className="space-y-8">
          {budgetCategories.map((item) => {
             const percent = (item.spent / item.total) * 100;
             const barColor = item.status === 'Complete' ? 'bg-green-500' : 'bg-indigo-600'; // Green if complete, else Blue
             
             return (
              <div key={item.id}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      ${item.spent.toLocaleString()} <span className="text-gray-400">/ ${item.total.toLocaleString()}</span>
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                
                {/* Category Progress Bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}