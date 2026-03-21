"use client";

import React, { useState, useEffect } from "react";
import { fetchAPI } from "../../../utils/api";
import { Plus, CheckCircle2, Circle, Search, Trash2, CalendarDays, ListTodo, UserCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

interface TeamMember { id: string; name: string; }
interface Task {
  id: string; eventId: string; title: string;
  priority: 'High' | 'Medium' | 'Low'; status: 'To Do' | 'In Progress' | 'Done';
  assigneeId: string | null; assigneeName: string | null;
}

export default function TaskListBoard() {
  const [eventsList, setEventsList] = useState<{ id: string, name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 NEW: Premium UI States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchTasksAndTeam(selectedEventId);

    // 🚀 NEW: Silently Auto-Refreshes when WebSockets are triggered by Topbar!
    const handleAutoRefresh = () => {
      if (selectedEventId) fetchTasksAndTeam(selectedEventId);
    };
    window.addEventListener('taskBoardRefresh', handleAutoRefresh);
    return () => window.removeEventListener('taskBoardRefresh', handleAutoRefresh);

  }, [selectedEventId]);

  const fetchActiveEvents = async () => {
    try {
      const response = await fetchAPI('/events', { method: 'GET' });
      if (response.success && response.events) {
        const activeEvents = response.events.map((evt: any) => ({ id: evt.id, name: evt.title }));
        setEventsList(activeEvents);
        if (activeEvents.length > 0) setSelectedEventId(activeEvents[0].id);
        else setIsLoading(false);
      }
    } catch (error) { setIsLoading(false); }
  };

  const fetchTasksAndTeam = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAPI(`/tasks/event/${eventId}`, { method: 'GET' });
      if (response.success) { setTasks(response.tasks); setTeamMembers(response.teamMembers); }
    } catch (error) { }
    finally { setIsLoading(false); }
  };

  const handleAddTask = async (priority: Task['priority']) => {
    try {
      const res = await fetchAPI(`/tasks/event/${selectedEventId}`, { method: 'POST', body: JSON.stringify({ title: "", priority, status: "To Do" }) });
      if (res.success) setTasks([...tasks, { id: res.taskId, eventId: selectedEventId, title: "", priority, status: "To Do", assigneeId: null, assigneeName: null }]);
    } catch (error) { }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);

    // 🚀 NEW: Prevent assignment if title is empty
    if (updates.assigneeId !== undefined && updates.assigneeId !== null && updates.assigneeId !== "") {
      if (!task?.title || task.title.trim() === '') {
        setErrorMessage("Please type a task name before assigning it to a team member.");
        setTimeout(() => setErrorMessage(null), 4000);
        return; // Abort the assignment!
      }
    }

    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      await fetchAPI(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (error) {
      fetchTasksAndTeam(selectedEventId);
    }
  };

  // 🚀 NEW: Replaced window.confirm with Custom Modal Logic
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const res = await fetchAPI(`/tasks/${taskToDelete}`, { method: 'DELETE' });
      if (res.success) setTasks(tasks.filter(t => t.id !== taskToDelete));
    } catch (error) { }
    setTaskToDelete(null);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.assigneeName && task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

  if (isLoading && eventsList.length === 0) return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-40 bg-gray-100 rounded-xl"></div>
          <div className="h-12 w-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
      {[1, 2].map(i => (
        <div key={i} className="h-64 w-full bg-gray-50 rounded-3xl border border-gray-100"></div>
      ))}
    </div>
  );
  if (eventsList.length === 0) return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-10 text-center shadow-sm">
      <ListTodo size={48} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Events</h3>
      <p className="text-gray-500 max-w-sm">You need an active event to assign tasks. Create one in your dashboard!</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto pb-10 relative">

      {errorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md animate-in slide-in-from-top-8 fade-in duration-300">
          <div className="bg-white border-l-4 border-l-orange-500 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 rounded-2xl flex items-center gap-4 ring-1 ring-black/5">
            <div className="p-2 bg-orange-50 rounded-xl">
              <AlertCircle size={22} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-gray-900">Action Required</h4>
              <p className="text-xs font-bold text-gray-500 mt-0.5">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <Trash2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Task?</h3>
              <p className="text-gray-500 font-medium leading-relaxed">This action cannot be undone. The assigned team member will be notified of this removal.</p>
            </div>
            <div className="p-6 pt-0 flex flex-col gap-3">
              <button onClick={confirmDeleteTask} className="w-full bg-rose-600 text-white py-4 rounded-2xl text-sm font-black hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95">
                Delete Permanently
              </button>
              <button onClick={() => setTaskToDelete(null)} className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all active:scale-95">
                Keep Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Task Board</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Coordinate your team's execution roadmap</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 p-1.5 rounded-xl flex items-center gap-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><CalendarDays size={18} /></div>
            <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="bg-transparent text-sm font-bold text-gray-800 outline-none pr-4 cursor-pointer max-w-[200px] truncate">
              {eventsList.map(evt => <option key={evt.id} value={evt.id}>{evt.name}</option>)}
            </select>
          </div>

          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search tasks or assignees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-all" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-indigo-600 font-medium animate-pulse">Fetching event tasks...</div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6">
          {priorities.map((priority) => {
            const priorityTasks = filteredTasks.filter(t => t.priority === priority);
            const headerTheme = { High: 'bg-red-50/80 text-red-700 border-red-100', Medium: 'bg-amber-50/80 text-amber-700 border-amber-100', Low: 'bg-blue-50/80 text-blue-700 border-blue-100' }[priority];

            return (
              <div key={priority} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className={`px-5 py-3.5 border-b flex justify-between items-center ${headerTheme}`}>
                  <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                    {priority} Priority
                  </h3>
                  <span className="text-xs font-bold bg-white/60 px-2.5 py-1 rounded-full shadow-sm">{priorityTasks.length} Tasks</span>
                </div>

                <div className="hidden md:grid grid-cols-[auto_1fr_220px_160px_50px] gap-6 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-8">Done</div><div>Task Name</div><div>Assignee</div><div>Status</div><div></div>
                </div>

                <div className="divide-y divide-gray-100">
                  {priorityTasks.map((task) => {
                    const isDone = task.status === 'Done';
                    return (
                      <div key={task.id} className={`grid grid-cols-1 md:grid-cols-[auto_1fr_220px_160px_50px] gap-6 px-6 py-4 items-center transition-all duration-200 hover:bg-gray-50/80 group ${isDone ? 'opacity-60 bg-gray-50/50' : ''}`}>

                        <button onClick={() => handleUpdateTask(task.id, { status: isDone ? 'To Do' : 'Done' })} className="hidden md:flex items-center justify-center w-8 text-gray-300 hover:text-indigo-600 transition-colors">
                          {isDone ? <CheckCircle2 className="text-green-500 drop-shadow-sm" size={24} /> : <Circle size={24} />}
                        </button>

                        <div>
                          <input
                            type="text"
                            defaultValue={task.title}
                            onBlur={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                            placeholder="Enter task name..."
                            className={`w-full font-bold text-sm bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-500 focus:bg-indigo-50/30 px-2 py-1 rounded-t-lg transition-all ${isDone ? 'line-through text-gray-400' : 'text-gray-800'
                              }`}
                          />
                        </div>

                        <div className="relative">
                          <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <select
                            value={task.assigneeId || ""} onChange={(e) => handleUpdateTask(task.id, { assigneeId: e.target.value || null })}
                            className={`w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow appearance-none cursor-pointer ${task.assigneeId ? 'bg-indigo-50/50 text-indigo-800 border-indigo-100' : 'bg-white text-gray-500'}`}
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <select
                            value={task.status} onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as Task['status'] })}
                            className={`w-full border rounded-xl px-3 py-2 text-sm outline-none font-bold text-center transition-all appearance-none cursor-pointer shadow-sm
                              ${isDone ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : task.status === 'In Progress' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                          >
                            <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
                          </select>
                        </div>

                        <button onClick={() => setTaskToDelete(task.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex justify-center opacity-0 group-hover:opacity-100" title="Delete Task">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}

                  <div className="p-4 bg-gray-50/30">
                    <button onClick={() => handleAddTask(priority)} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition px-4 py-2 rounded-xl hover:bg-indigo-100 w-max">
                      <Plus size={18} /> Add {priority.toLowerCase()} priority task
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}