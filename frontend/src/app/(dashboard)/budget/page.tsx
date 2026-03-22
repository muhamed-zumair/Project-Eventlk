"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../../utils/api";
import { useEventContext } from "../../../context/EventContext"; // 🚀 1. Import the Brain
import { Banknote, TrendingUp, AlertCircle, ChevronDown, X, CalendarDays, Plus, PlusCircle, Receipt, User, Clock, AlertTriangle, Sparkles, Loader2, CheckCircle, Info, ShieldAlert, ShieldCheck } from "lucide-react"; // 🚀 2. Added ShieldAlert

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
 const { myRole, isLoadingContext, selectedEventId } = useEventContext(); // 🚀 Use the global ID// 🚀 Ask the Brain for the role!
  
  // --- LIVE DATA STATES ---
  const [eventsList, setEventsList] = useState<EventData[]>([]);

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
  // 🚀 Now reacts directly to the Global Topbar Selector!
  useEffect(() => {
    const syncAndFetch = async () => {
      // 1. If we have a global selection, fetch its financials immediately
      if (selectedEventId) {
        await fetchBudgetOverview(selectedEventId);
      } 
      
      // 2. Always fetch the events list once to handle empty states/metadata
      try {
        const response = await fetchAPI('/events', { method: 'GET' });
        if (response.success && response.events) {
          const activeEvents = response.events.map((evt: any) => ({
            id: evt.id, 
            title: evt.title, 
            budget: Number(evt.total_budget), 
            isAiAssisted: evt.is_ai_assisted
          }));
          setEventsList(activeEvents);
          
          // 🚀 FIX: If we just loaded the list and a global ID exists, 
          // make sure we fetch the budget for it specifically.
          if (selectedEventId) {
            await fetchBudgetOverview(selectedEventId);
          }
        }
      } catch (e) { 
        console.error("Sync Error:", e); 
      } finally {
        // Only stop the "Big Loading" once we've checked the events list
        setIsLoading(false);
      }
    };

    syncAndFetch();
  }, [selectedEventId]); // 🚀 Now listens to the Topbar!

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

      if (!selectedEventId) return; // 🚀 Guard: Stop if ID is null
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

      if (!selectedEventId) return; // 🚀 Guard: Stop if ID is null
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

  // 🚀 THE UPDATED SECURITY GATE
  // If we are still figuring out the user's identity, show the loader.
  if (isLoadingContext) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  // If the user HAS events but they are still being fetched, show the loader.
  // BUT, if they have ZERO events, skip this and go straight to the "Welcoming Empty State".
  if (isLoading && eventsList.length > 0) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  // Block anyone who isn't a President or Treasurer (but ignore if myRole is null, meaning they have no events yet)
  if (myRole && myRole !== 'President' && myRole !== 'Treasurer') {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-4 ring-rose-50 rotate-3">
          <ShieldAlert size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Access Denied</h2>
        <p className="text-gray-500 font-medium text-center max-w-md leading-relaxed">
          Your current role (<span className="text-gray-900 font-bold">{myRole.replace('_', ' ')}</span>) does not have permission to view or manage financials for this event. 
        </p>
        <button onClick={() => window.location.href = '/dashboard'} className="mt-8 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-xl active:scale-95">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // 🚀 WELCOMING EMPTY STATE: For users with no events yet
  if (eventsList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner rotate-3 ring-8 ring-indigo-50/50">
          <Banknote size={48} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Financial Command Center</h2>
        <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed mb-10">
          Take total control of your event's economy. Once you create an event or join a team, you'll be able to allocate LKR to categories, track live spending, and generate AI-powered financial strategies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {[
            { icon: TrendingUp, title: "Live Tracking", desc: "Monitor every cent in real-time." },
            { icon: Sparkles, title: "AI Allocation", desc: "Smart budget splits for your scale." },
            { icon: ShieldCheck, title: "Safe Spending", desc: "Role-based approval for expenses." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3"><feature.icon size={24} /></div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-500 font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.dispatchEvent(new Event('openCreateModal'))}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} strokeWidth={3} /> Start Planning Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full flex flex-col max-w-5xl mx-auto pb-20">
      
      {/* Page Header - 🚀 Cleaned: Global Selector in Topbar handles event switching */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Budget Tracker</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Monitor event spending, allocations, and live financial health</p>
        </div>
        
        {/* Local selector removed. Switch events in the Topbar! */}
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