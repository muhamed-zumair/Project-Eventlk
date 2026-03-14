"use client";

import { useState } from "react";
import { Banknote, TrendingUp, AlertCircle, ChevronDown, X, CalendarDays, Plus, PlusCircle } from "lucide-react";

// --- Types ---
interface BudgetCategory {
  id: string;
  eventId: string;
  name: string;
  spent: number;
  total: number;
}

// --- Mock Events ---
const myEvents = [
  { id: 'evt_1', name: "Annual Tech Summit 2026 (AI Generated)" },
  { id: 'evt_2', name: "Spring Conference (AI Generated)" }
];

// --- Mock Data ---
const initialBudgets: BudgetCategory[] = [
  { id: '1', eventId: 'evt_1', name: 'Venue Rental', spent: 15000, total: 50000 },
  { id: '2', eventId: 'evt_1', name: 'Catering', spent: 18500, total: 19800 },
  { id: '3', eventId: 'evt_1', name: 'Marketing', spent: 6200, total: 9800 },
  { id: '4', eventId: 'evt_1', name: 'Equipment', spent: 5500, total: 30600 },
  
  { id: '6', eventId: 'evt_2', name: 'Venue Rental', spent: 5000, total: 10000 },
  { id: '7', eventId: 'evt_2', name: 'Catering', spent: 2000, total: 8000 },
];

const StatusBadge = ({ spent, total }: { spent: number, total: number }) => {
  let status = "Not Started";
  let badgeStyle = "bg-gray-100 text-gray-600 border border-gray-200";

  if (spent > 0 && spent < total) {
    status = "Under Budget";
    badgeStyle = "bg-blue-100 text-blue-700 border border-blue-200";
  } else if (spent === total && total > 0) {
    status = "Complete";
    badgeStyle = "bg-green-100 text-green-700 border border-green-200";
  } else if (spent > total) {
    status = "Over Budget";
    badgeStyle = "bg-red-100 text-red-700 border border-red-200";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default function BudgetPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>(myEvents[0].id);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(initialBudgets);

  // Add Expense State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");

  // Add Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");

  const currentEventBudgets = budgets.filter(b => b.eventId === selectedEventId);
  const totalBudget = currentEventBudgets.reduce((sum, cat) => sum + cat.total, 0);
  const totalSpent = currentEventBudgets.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Add Expense Logic
  const handleOpenModal = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false); 
  };
  const handleCloseModal = () => {
    setSelectedCategory(null);
    setExpenseAmount(""); 
    setExpenseDescription("");
  };
  const handleAddExpense = () => {
    if (!selectedCategory || !expenseAmount) return;
    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const updatedBudgets = budgets.map(cat => {
      if (cat.id === selectedCategory.id) {
        return { ...cat, spent: cat.spent + parsedAmount };
      }
      return cat;
    });

    setBudgets(updatedBudgets);
    handleCloseModal();
  };

  // Add Category Logic (For Manual Flow)
  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryAmount) return;
    const parsedAmount = parseFloat(newCategoryAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      eventId: selectedEventId,
      name: newCategoryName,
      spent: 0,
      total: parsedAmount
    };

    setBudgets([...budgets, newCategory]);
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    setNewCategoryAmount("");
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Budget Tracker</h2>
          <p className="text-gray-500 text-sm mt-1">Monitor event spending and allocations</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm">
              <CalendarDays size={18} />
            </div>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer max-w-[250px] truncate"
            >
              {myEvents.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {currentEventBudgets.length === 0 ? (
        /* EMPTY STATE FOR MANUAL EVENTS */
        <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center min-h-[400px]">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <Banknote size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Budget Allocated Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Since this event was created manually, you need to set up your budget categories (like Venue, Food, Marketing) before you can start tracking expenses.
          </p>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
          >
            <Plus size={18} /> Create First Category
          </button>
        </div>
      ) : (
        /* NORMAL DASHBOARD */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Banknote size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Budget</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">LKR {totalBudget.toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">LKR {totalSpent.toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-lg ${remaining < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{remaining < 0 ? 'Over Budget By' : 'Remaining'}</p>
                <h3 className={`text-2xl font-bold mt-1 ${remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  LKR {Math.abs(remaining).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1">
            <div className="flex justify-between items-start mb-2 relative">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Budget Overview</h3>
                <p className="text-sm text-gray-500">{percentageUsed.toFixed(1)}% of total budget used</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* NEW: Add Category Button */}
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <PlusCircle size={16} /> Category
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                  >
                    + Expense <ChevronDown size={16} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-10 py-2 overflow-hidden">
                      <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Select Category</div>
                      {currentEventBudgets.map((category) => {
                        const catRemaining = category.total - category.spent;
                        return (
                          <button 
                            key={category.id}
                            onClick={() => handleOpenModal(category)}
                            className="w-full px-4 py-3 flex justify-between items-center hover:bg-indigo-50 transition-colors text-sm text-left border-b border-gray-50 last:border-0"
                          >
                            <span className="font-medium text-gray-700">{category.name}</span>
                            <span className={`text-xs font-bold ${catRemaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                              {catRemaining < 0 ? 'Over' : `LKR ${catRemaining.toLocaleString()}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-100 h-3 rounded-full mb-10 mt-6 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${percentageUsed > 100 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min(percentageUsed, 100)}%` }}></div>
            </div>

            <div className="space-y-8">
              {currentEventBudgets.map((item) => {
                 const percent = item.total > 0 ? (item.spent / item.total) * 100 : 0;
                 const isOverBudget = item.spent > item.total;
                 const isComplete = item.spent === item.total && item.total > 0;
                 const barColor = isOverBudget ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-indigo-500';
                 
                 return (
                  <div key={item.id}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm mt-1">
                          <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-900 font-medium'}>LKR {item.spent.toLocaleString()}</span>
                          <span className="text-gray-400"> / LKR {item.total.toLocaleString()}</span>
                        </p>
                      </div>
                      <StatusBadge spent={item.spent} total={item.total} />
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-800">New Budget Category</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900" placeholder="e.g. Venue, Catering, Decorations" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Allocated Amount *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm font-medium">LKR</span></div>
                  <input type="number" value={newCategoryAmount} onChange={(e) => setNewCategoryAmount(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-12 pr-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 font-medium" placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50 shrink-0">
              <button onClick={handleAddCategory} disabled={!newCategoryName || !newCategoryAmount || Number(newCategoryAmount) <= 0} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Create Category</button>
              <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD EXPENSE MODAL (Unchanged) --- */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-800">Add Expense</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-500 mb-1 font-bold uppercase tracking-wider">Logging to Category</p>
                <h3 className="text-lg font-bold text-indigo-900 mb-2">{selectedCategory.name}</h3>
                <div className="flex justify-between text-sm text-indigo-700 font-medium">
                  <p>Current: LKR {selectedCategory.spent.toLocaleString()} / LKR {selectedCategory.total.toLocaleString()}</p>
                  <p>Remaining: LKR {(selectedCategory.total - selectedCategory.spent).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expense Amount *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm font-medium">LKR</span></div>
                  <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="w-full border border-gray-300 rounded-xl pl-12 pr-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 font-medium" placeholder="0.00" autoFocus />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50 shrink-0">
              <button onClick={handleAddExpense} disabled={!expenseAmount || Number(expenseAmount) <= 0} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Save Expense</button>
              <button onClick={handleCloseModal} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}