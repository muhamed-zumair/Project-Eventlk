"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, Circle, Search, Trash2, CalendarDays } from "lucide-react";

interface Task {
  id: string;
  eventId: string; // NEW: Ties the task to a specific event
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Done';
  assignee: string; 
}

// Mock Events for the dropdown
const myEvents = [
  { id: 'evt_1', name: "Annual Tech Summit 2026" },
  { id: 'evt_2', name: "Spring Conference" },
];

const teamMembers = [
  "Unassigned",
  "Sarah Mitchell",
  "David Kim",
  "Emily Chen",
  "Alex Johnson",
  "Michael Brown",
];

// Notice how each task now has an eventId attached to it!
const initialTasks: Task[] = [
  { id: '1', eventId: 'evt_1', title: 'Book catering service', priority: 'High', status: 'In Progress', assignee: 'Emily Chen' },
  { id: '2', eventId: 'evt_1', title: 'Contact vendor for stage setup', priority: 'High', status: 'Not Started', assignee: 'Michael Brown' },
  { id: '3', eventId: 'evt_1', title: 'Design event banner', priority: 'Medium', status: 'In Progress', assignee: 'Alex Johnson' },
  // These tasks belong to the Spring Conference
  { id: '4', eventId: 'evt_2', title: 'Draft guest speaker invite list', priority: 'High', status: 'Not Started', assignee: 'Sarah Mitchell' },
  { id: '5', eventId: 'evt_2', title: 'Review hotel block contracts', priority: 'Medium', status: 'Done', assignee: 'David Kim' },
];

export default function TaskListBoard() {
  // NEW: State to track which event we are currently looking at
  const [selectedEventId, setSelectedEventId] = useState<string>(myEvents[0].id);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Filter tasks to ONLY show the ones for the currently selected event
  const currentEventTasks = tasks.filter(task => task.eventId === selectedEventId);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAssigneeChange = (taskId: string, newAssignee: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, assignee: newAssignee } : t));
  };

  const handleTitleChange = (taskId: string, newTitle: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t));
  };

  // NEW: When adding a task, it automatically attaches to the currently selected event!
  const handleAddTask = (priority: Task['priority']) => {
    const newTask: Task = {
      id: Date.now().toString(), 
      eventId: selectedEventId, // Automatically locks to the active event
      title: '', 
      priority: priority,
      status: 'Not Started',
      assignee: 'Unassigned'
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      
      {/* Header with Event Selector */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Task List</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track tasks for specific events</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* NEW: The Event Selector Dropdown */}
          <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm">
              <CalendarDays size={18} />
            </div>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer"
            >
              {myEvents.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-48 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto space-y-8 pb-10">
        {priorities.map((priority) => {
          // Filter again by priority using our ALREADY filtered event list
          const priorityTasks = currentEventTasks.filter(t => t.priority === priority);
          
          const headerColors = {
            High: 'bg-red-50 text-red-700 border-red-100',
            Medium: 'bg-orange-50 text-orange-700 border-orange-100',
            Low: 'bg-blue-50 text-blue-700 border-blue-100'
          }[priority];

          return (
            <div key={priority} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              
              <div className={`px-4 py-3 border-b flex justify-between items-center ${headerColors}`}>
                <h3 className="font-semibold text-sm uppercase tracking-wider">{priority} Priority</h3>
                <span className="text-xs font-bold bg-white px-2 py-1 rounded-full opacity-80">
                  {priorityTasks.length} Tasks
                </span>
              </div>

              <div className="hidden md:grid grid-cols-[auto_1fr_200px_160px_40px] gap-4 px-4 py-2 bg-gray-50/50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="w-8">Done</div>
                <div>Task Name</div>
                <div>Assignee</div>
                <div>Status</div>
                <div></div>
              </div>

              <div className="divide-y divide-gray-100">
                {priorityTasks.map((task) => (
                  <div key={task.id} className={`grid grid-cols-1 md:grid-cols-[auto_1fr_200px_160px_40px] gap-4 p-4 items-center transition hover:bg-gray-50 ${task.status === 'Done' ? 'opacity-60' : ''}`}>
                    
                    <button 
                      onClick={() => handleStatusChange(task.id, task.status === 'Done' ? 'Not Started' : 'Done')}
                      className="hidden md:flex items-center justify-center w-8 text-gray-400 hover:text-indigo-600 transition"
                    >
                      {task.status === 'Done' ? <CheckCircle2 className="text-green-500" size={22} /> : <Circle size={22} />}
                    </button>

                    <div>
                      <input 
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTitleChange(task.id, e.target.value)}
                        placeholder="Type task name here..."
                        className={`w-full font-medium text-sm bg-transparent outline-none focus:border-b-2 focus:border-indigo-400 pb-1 ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-800'}`}
                        autoFocus={task.title === ''} 
                      />
                    </div>

                    <div>
                      <select 
                        value={task.assignee}
                        onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                        className="w-full border border-gray-200 rounded-md p-1.5 text-sm outline-none focus:border-indigo-500 text-gray-700 bg-white"
                      >
                        {teamMembers.map(member => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        className={`w-full border rounded-md p-1.5 text-sm outline-none font-medium focus:border-indigo-500 bg-white
                          ${task.status === 'Done' ? 'border-green-200 text-green-700' : 
                            task.status === 'In Progress' ? 'border-orange-200 text-orange-700' : 
                            'border-gray-200 text-gray-600'}`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-300 hover:text-red-500 transition flex justify-center"
                      title="Delete Task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="p-3 bg-gray-50/30">
                  <button 
                    onClick={() => handleAddTask(priority)}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition px-2 py-1 rounded-md hover:bg-indigo-50"
                  >
                    <Plus size={16} /> Add {priority.toLowerCase()} priority task
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}