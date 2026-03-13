"use client";

import { useState } from "react";
import { Banknote, TrendingUp, AlertCircle, ChevronDown, X } from "lucide-react";

// --- Types ---
interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  total: number;
  status: 'Complete' | 'On Track' | 'Under Budget' | 'Over Budget' | 'Not Started';
}

// --- Mock Data ---
const budgetCategories: BudgetCategory[] = [
  { id: '1', name: 'Venue Rental', spent: 15000, total: 15000, status: 'Complete' },
  { id: '2', name: 'Catering', spent: 18500, total: 20000, status: 'On Track' },
  { id: '3', name: 'Marketing', spent: 6200, total: 8000, status: 'On Track' },
  { id: '4', name: 'Equipment', spent: 5500, total: 10000, status: 'Under Budget' },
  { id: '5', name: 'Miscellaneous', spent: 0, total: 7000, status: 'Not Started' },
];

// --- Helper Component for Status Badges ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Complete': 'bg-green-100 text-green-700',
    'On Track': 'bg-blue-100 text-blue-700',
    'Under Budget': 'bg-indigo-100 text-indigo-700',
    'Over Budget': 'bg-red-100 text-red-700',
    'Not Started': 'bg-gray-100 text-gray-600',
  };

  const badgeStyle = styles[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default function BudgetPage() {
  // --- State ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  
  // Calculate totals for the top cards
  const totalBudget = 60000;
  const totalSpent = 45200;
  const remaining = totalBudget - totalSpent;
  const percentageUsed = (totalSpent / totalBudget) * 100;

  // --- Handlers ---
  const handleOpenModal = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setExpenseAmount(""); // Reset form
  };

  return (
    <div className="space-y-6 relative">
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
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Budget</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">LKR {totalBudget.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Spent</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">LKR {totalSpent.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Remaining */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Remaining</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">LKR {remaining.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Main Budget Overview Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        
        {/* Section Header with Add Expense Button */}
        <div className="flex justify-between items-start mb-2 relative">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Budget Overview</h3>
            <p className="text-sm text-gray-500">{percentageUsed.toFixed(1)}% of total budget used</p>
          </div>
          
          {/* Dropdown Container */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              + Add Expense <ChevronDown size={16} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-10 py-2 overflow-hidden">
                {budgetCategories.map((category) => {
                  const catRemaining = category.total - category.spent;
                  return (
                    <button 
                      key={category.id}
                      onClick={() => handleOpenModal(category)}
                      className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors text-sm text-left"
                    >
                      <span className="font-medium text-gray-700">{category.name}</span>
                      <span className="text-gray-500">LKR {catRemaining.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="w-full bg-gray-100 h-3 rounded-full mb-10 mt-6 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${percentageUsed}%` }}
          ></div>
        </div>

        {/* Individual Category Items */}
        <div className="space-y-8">
          {budgetCategories.map((item) => {
             const percent = item.total > 0 ? (item.spent / item.total) * 100 : 0;
             const barColor = item.status === 'Complete' ? 'bg-green-500' : 'bg-indigo-600';
             
             return (
              <div key={item.id}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      LKR {item.spent.toLocaleString()} <span className="text-gray-400">/ LKR {item.total.toLocaleString()}</span>
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

      {/* --- Modal Overlay --- */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 pt-0 space-y-6">
              
              {/* Category Info Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <h3 className="text-md font-semibold text-gray-900 mb-2">{selectedCategory.name}</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Current: LKR {selectedCategory.spent.toLocaleString()} / LKR {selectedCategory.total.toLocaleString()}</p>
                  <p>Remaining: LKR {(selectedCategory.total - selectedCategory.spent).toLocaleString()}</p>
                </div>
              </div>

              {/* Expense Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Amount *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">LKR</span>
                  </div>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="block w-full pl-12 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none transition-shadow"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  rows={3}
                  className="block w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none transition-shadow resize-none"
                  placeholder="What was this expense for?"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!expenseAmount || Number(expenseAmount) <= 0}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Add Expense
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}