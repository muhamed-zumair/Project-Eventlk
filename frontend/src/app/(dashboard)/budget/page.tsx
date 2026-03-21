"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../../utils/api";
import { Banknote, TrendingUp, AlertCircle, ChevronDown, X, CalendarDays, Plus, PlusCircle, Receipt, User, Clock, AlertTriangle, Sparkles, Loader2, CheckCircle, Info } from "lucide-react";

// --- Types ---
interface BudgetCategory {
  id: string;
  eventId: string;
  name: string;
  spent: number;
  total: number;
}

interface ExpenseTransaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  loggedBy: string;
  date: string;
}

interface EventData {
  id: string;
  title: string;
  budget: number;
  isAiAssisted: boolean;
}

const StatusBadge = ({ spent, total }: { spent: number, total: number }) => {
  let status = "Not Started";
  let badgeStyle = "bg-gray-100 text-gray-600 border border-gray-200";

  if (spent > 0 && spent < total) {
    status = "Under Budget";
    badgeStyle = "bg-blue-100 text-blue-700 border border-blue-200";
  } else if (spent === total && total > 0) {
    status = "On Track";
    badgeStyle = "bg-green-100 text-green-700 border border-green-200";
  } else if (spent > total) {
    status = "Over Budget";
    badgeStyle = "bg-red-100 text-red-700 border border-red-200";
  }

  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeStyle}`}>{status}</span>;
};

export default function BudgetPage() {
  // --- LIVE DATA STATES ---
  const [eventsList, setEventsList] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 NEW: Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };

  // Modals State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [viewDetailsCategory, setViewDetailsCategory] = useState<BudgetCategory | null>(null);
  
  // Inputs
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");

  // --- API FETCHING LOGIC ---
  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchBudgetOverview(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchMyEvents = async () => {
    try {
      const response = await fetchAPI('/events', { method: 'GET' });
      if (response.success && response.events) {
        // We only want to show events that are currently "In Progress"
        const activeEvents = response.events.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          budget: Number(evt.total_budget),
          isAiAssisted: evt.is_ai_assisted
        }));
        
        setEventsList(activeEvents);
        if (activeEvents.length > 0) {
          setSelectedEventId(activeEvents[0].id);
        } else {
          setIsLoading(false); // No events found
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  const fetchBudgetOverview = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAPI(`/budgets/${eventId}`, { method: 'GET' });
      if (response.success) {
        setBudgets(response.categories);
        setExpenses(response.expenses);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ADD EXPENSE TO DATABASE ---
  const handleAddExpense = async () => {
    if (!selectedCategory || !expenseAmount || isSaving) return;
    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSaving(true);
    try {
      const payload = {
        categoryId: selectedCategory.id,
        amount: parsedAmount,
        description: expenseDescription || 'Uncategorized Expense'
      };

      const response = await fetchAPI(`/budgets/${selectedEventId}/expense`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        await fetchBudgetOverview(selectedEventId); // Refresh live data!
        handleCloseModal();
        showToast("Expense logged successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      showToast("Failed to save expense.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- ADD CATEGORY TO DATABASE ---
  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategoryAmount || isSaving) return;
    const parsedAmount = parseFloat(newCategoryAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSaving(true);
    try {
      const payload = {
        name: newCategoryName,
        amount: parsedAmount
      };

      const response = await fetchAPI(`/budgets/${selectedEventId}/category`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        await fetchBudgetOverview(selectedEventId); // Refresh live data!
        setIsCategoryModalOpen(false);
        setNewCategoryName("");
        setNewCategoryAmount("");
        showToast("Category created successfully!", "success");
      }
    } catch (error: any) {
      showToast("Failed to create category.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenModal = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false); 
  };
  
  const handleCloseModal = () => {
    setSelectedCategory(null);
    setExpenseAmount(""); 
    setExpenseDescription("");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // --- CALCULATIONS ---
  const currentEvent = eventsList.find(e => e.id === selectedEventId);
  const masterBudget = currentEvent?.budget || 0;
  
  const totalAllocatedToCategories = budgets.reduce((sum, cat) => sum + cat.total, 0);
  const totalSpent = budgets.reduce((sum, cat) => sum + cat.spent, 0);
  const overallRemaining = masterBudget - totalSpent;
  const percentageUsed = masterBudget > 0 ? (totalSpent / masterBudget) * 100 : 0;

  // The Soft Warning Logic
  const isOverAllocated = totalAllocatedToCategories > masterBudget;
  const overAllocatedAmount = totalAllocatedToCategories - masterBudget;

  if (isLoading && eventsList.length === 0) {
    return <div className="flex justify-center items-center h-full text-indigo-600 animate-pulse">Loading budget tracker...</div>;
  }

  if (eventsList.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-10 text-center shadow-sm">
        <Banknote size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Events</h3>
        <p className="text-gray-500 max-w-sm">You need an active event to track budgets. Go to the dashboard to create one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full flex flex-col max-w-5xl mx-auto pb-20">
      
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
              {eventsList.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-indigo-600 animate-pulse font-medium">Fetching live financials...</div>
      ) : budgets.length === 0 ? (
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
          {/* THE SOFT WARNING UI */}
          {isOverAllocated && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-orange-900">Over-Allocated Warning</h4>
                <p className="text-sm text-orange-700 mt-0.5">
                  You have assigned <strong>LKR {totalAllocatedToCategories.toLocaleString()}</strong> to your categories, which exceeds your Master Event Budget of <strong>LKR {masterBudget.toLocaleString()}</strong> by LKR {overAllocatedAmount.toLocaleString()}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-6 rounded-xl border shadow-sm flex items-start gap-4 ${isOverAllocated ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-100'}`}>
              <div className={`p-3 rounded-lg ${isOverAllocated ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}><Banknote size={24} /></div>
              <div>
                <p className={`text-sm font-medium ${isOverAllocated ? 'text-orange-600/80' : 'text-gray-500'}`}>Master Event Budget</p>
                <h3 className={`text-2xl font-bold mt-1 ${isOverAllocated ? 'text-orange-900' : 'text-gray-900'}`}>LKR {masterBudget.toLocaleString()}</h3>
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
              <div className={`p-3 rounded-lg ${overallRemaining < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{overallRemaining < 0 ? 'Over Master Budget By' : 'Remaining Event Funds'}</p>
                <h3 className={`text-2xl font-bold mt-1 ${overallRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  LKR {Math.abs(overallRemaining).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1">
            <div className="flex justify-between items-start mb-2 relative">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Budget Overview
                  {currentEvent?.isAiAssisted && <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1"><Sparkles size={10}/> AI Managed</span>}
                </h3>
                <p className="text-sm text-gray-500">{percentageUsed.toFixed(1)}% of total budget utilized</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* --- HIDE THE ADD CATEGORY BUTTON FOR AI EVENTS --- */}
                {!currentEvent?.isAiAssisted && (
                  <button 
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <PlusCircle size={16} /> Category
                  </button>
                )}

                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                  >
                    + Expense <ChevronDown size={16} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-10 py-2 overflow-hidden">
                      <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Log Expense To...</div>
                      {budgets.map((category) => {
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
              {budgets.map((item) => {
                 const percent = item.total > 0 ? (item.spent / item.total) * 100 : 0;
                 const isOverBudget = item.spent > item.total;
                 const isComplete = item.spent === item.total && item.total > 0;
                 const barColor = isOverBudget ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-indigo-500';
                 
                 return (
                  <div key={item.id}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <button 
                          onClick={() => setViewDetailsCategory(item)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="text-right">
                        <StatusBadge spent={item.spent} total={item.total} />
                        <p className="text-sm mt-1.5">
                          <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-gray-900 font-bold'}>LKR {item.spent.toLocaleString()}</span>
                          <span className="text-gray-500 font-medium"> / LKR {item.total.toLocaleString()}</span>
                        </p>
                      </div>
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
              <button onClick={handleAddCategory} disabled={!newCategoryName || !newCategoryAmount || Number(newCategoryAmount) <= 0 || isSaving} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Create Category"}
              </button>
              <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD EXPENSE MODAL --- */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-800">Log an Expense</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none"
                  placeholder="e.g. Caterer initial deposit"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50 shrink-0">
              <button onClick={handleAddExpense} disabled={!expenseAmount || Number(expenseAmount) <= 0 || isSaving} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Expense"}
              </button>
              <button onClick={handleCloseModal} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {viewDetailsCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewDetailsCategory.name} History</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Total Spent: <span className="font-semibold text-gray-700">LKR {viewDetailsCategory.spent.toLocaleString()}</span>
                </p>
              </div>
              <button onClick={() => setViewDetailsCategory(null)} className="text-gray-400 hover:text-gray-600 transition bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <div className="space-y-4">
                {expenses.filter(exp => exp.categoryId === viewDetailsCategory.id).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm flex flex-col items-center">
                    <Receipt className="text-gray-300 mb-2" size={32} />
                    No expenses recorded for this category yet.
                  </div>
                ) : (
                  expenses
                    .filter(exp => exp.categoryId === viewDetailsCategory.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                    <div key={transaction.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm mb-1">{transaction.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><User size={14} className="text-gray-400"/> {transaction.loggedBy}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {formatDate(transaction.date)}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold bg-indigo-50 text-indigo-700">
                          LKR {transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-white shrink-0">
              <button 
                onClick={() => setViewDetailsCategory(null)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🚀 NEW: Beautiful Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[250] bg-white border shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`p-2.5 rounded-full border shadow-sm ${toast.type === 'success' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
          </div>
          <div className="pr-5">
            <h4 className="text-sm font-bold text-gray-900">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className={`p-1.5 rounded-lg transition ${toast.type === 'success' ? 'text-green-400 hover:bg-green-50 hover:text-green-600' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}