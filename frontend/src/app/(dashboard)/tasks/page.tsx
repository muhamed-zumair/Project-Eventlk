"use client";

import React, { useState, useEffect } from "react";
import { fetchAPI } from "../../../utils/api";
import { Plus, CheckCircle2, Circle, Search, Trash2, CalendarDays, ListTodo, UserCircle2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
}

interface Task {
  id: string;
  eventId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done'; // Matches DB ENUM perfectly!
  assigneeId: string | null;
  assigneeName: string | null;
}

export default function TaskListBoard() {
  const [eventsList, setEventsList] = useState<{id: string, name: string}[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchTasksAndTeam(selectedEventId);
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
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  const fetchTasksAndTeam = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAPI(`/tasks/event/${eventId}`, { method: 'GET' });
      if (response.success) {
        setTasks(response.tasks);
        setTeamMembers(response.teamMembers);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (priority: Task['priority']) => {
    try {
      const payload = { title: "", priority, status: "To Do" };
      const res = await fetchAPI(`/tasks/event/${selectedEventId}`, { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        setTasks([...tasks, { id: res.taskId, eventId: selectedEventId, title: "", priority, status: "To Do", assigneeId: null, assigneeName: null }]);
      }
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // Optimistic UI Update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    try {
      await fetchAPI(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (error) {
      console.error("Failed to update task", error);
      fetchTasksAndTeam(selectedEventId); // Revert on failure
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const res = await fetchAPI(`/tasks/${taskId}`, { method: 'DELETE' });
      if (res.success) setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  // Filter tasks by search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (task.assigneeName && task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

  if (isLoading && eventsList.length === 0) {
    return <div className="flex justify-center items-center h-full text-indigo-600 animate-pulse">Loading Task Board...</div>;
  }

  if (eventsList.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-10 text-center shadow-sm">
        <ListTodo size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Events</h3>
        <p className="text-gray-500 max-w-sm">You need an active event to assign tasks. Create one in your dashboard!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto pb-10">
      
      {/* Premium Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Task Board</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Coordinate your team's execution roadmap</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 p-1.5 rounded-xl flex items-center gap-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
              <CalendarDays size={18} />
            </div>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-800 outline-none pr-4 cursor-pointer max-w-[200px] truncate"
            >
              {eventsList.map(evt => <option key={evt.id} value={evt.id}>{evt.name}</option>)}
            </select>
          </div>

          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-indigo-600 font-medium animate-pulse">Fetching event tasks...</div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6">
          {priorities.map((priority) => {
            const priorityTasks = filteredTasks.filter(t => t.priority === priority);
            
            const headerTheme = {
              High: 'bg-red-50/80 text-red-700 border-red-100',
              Medium: 'bg-amber-50/80 text-amber-700 border-amber-100',
              Low: 'bg-blue-50/80 text-blue-700 border-blue-100'
            }[priority];

            return (
              <div key={priority} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className={`px-5 py-3.5 border-b flex justify-between items-center ${headerTheme}`}>
                  <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                    {priority} Priority
                  </h3>
                  <span className="text-xs font-bold bg-white/60 px-2.5 py-1 rounded-full shadow-sm">
                    {priorityTasks.length} Tasks
                  </span>
                </div>

                <div className="hidden md:grid grid-cols-[auto_1fr_220px_160px_50px] gap-6 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-8">Done</div>
                  <div>Task Name</div>
                  <div>Assignee</div>
                  <div>Status</div>
                  <div></div>
                </div>

                <div className="divide-y divide-gray-100">
                  {priorityTasks.map((task) => {
                    const isDone = task.status === 'Done';
                    return (
                      <div key={task.id} className={`grid grid-cols-1 md:grid-cols-[auto_1fr_220px_160px_50px] gap-6 px-6 py-4 items-center transition-all duration-200 hover:bg-gray-50/80 group ${isDone ? 'opacity-60 bg-gray-50/50' : ''}`}>
                        
                        <button 
                          onClick={() => handleUpdateTask(task.id, { status: isDone ? 'To Do' : 'Done' })}
                          className="hidden md:flex items-center justify-center w-8 text-gray-300 hover:text-indigo-600 transition-colors"
                        >
                          {isDone ? <CheckCircle2 className="text-green-500 drop-shadow-sm" size={24} /> : <Circle size={24} />}
                        </button>

                        <div>
                          <input 
                            type="text"
                            defaultValue={task.title}
                            onBlur={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                            placeholder="What needs to be done?"
                            className={`w-full font-semibold text-sm bg-transparent outline-none focus:border-b-2 focus:border-indigo-500 pb-1 transition-all ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}
                          />
                        </div>

                        <div className="relative">
                          <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <select 
                            value={task.assigneeId || ""}
                            onChange={(e) => handleUpdateTask(task.id, { assigneeId: e.target.value || null })}
                            className={`w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow appearance-none cursor-pointer ${task.assigneeId ? 'bg-indigo-50/50 text-indigo-800 border-indigo-100' : 'bg-white text-gray-500'}`}
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map(member => (
                              <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <select 
                            value={task.status}
                            onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as Task['status'] })}
                            className={`w-full border rounded-xl px-3 py-2 text-sm outline-none font-bold text-center transition-all appearance-none cursor-pointer shadow-sm
                              ${isDone ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 
                                task.status === 'In Progress' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 
                                'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>

                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex justify-center opacity-0 group-hover:opacity-100"
                          title="Delete Task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}

                  <div className="p-4 bg-gray-50/30">
                    <button 
                      onClick={() => handleAddTask(priority)}
                      className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition px-4 py-2 rounded-xl hover:bg-indigo-100 w-max"
                    >
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