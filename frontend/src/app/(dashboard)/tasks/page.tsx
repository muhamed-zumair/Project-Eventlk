"use client";

import React, { useState } from "react";
import { MoreHorizontal, Plus, X } from "lucide-react";

// Types for your backend data
interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string; // initials
  assigneeColor: string;
}

const columns = [
  { id: 'todo', title: 'To Do', count: 2 },
  { id: 'inprogress', title: 'In Progress', count: 3 },
  { id: 'review', title: 'Review', count: 1 },
  { id: 'done', title: 'Done', count: 2 },
];

const tasks: Record<string, Task[]> = {
  todo: [
    { id: '1', title: 'Design event banner', priority: 'Medium', assignee: 'JD', assigneeColor: 'bg-blue-600' },
    { id: '2', title: 'Book catering service', priority: 'High', assignee: 'EC', assigneeColor: 'bg-purple-600' },
  ],
  inprogress: [
    { id: '3', title: 'Contact vendor for stage setup', priority: 'High', assignee: 'MB', assigneeColor: 'bg-green-600' },
    { id: '4', title: 'Finalize budget allocation', priority: 'High', assignee: 'SM', assigneeColor: 'bg-indigo-600' },
    { id: '5', title: 'Update event website', priority: 'Medium', assignee: 'JD', assigneeColor: 'bg-blue-600' },
  ],
  review: [
    { id: '6', title: 'Event proposal document', priority: 'Low', assignee: 'EC', assigneeColor: 'bg-purple-600' },
  ],
  done: [
     { id: '7', title: 'Send invitations to sponsors', priority: 'Medium', assignee: 'MB', assigneeColor: 'bg-green-600' },
     { id: '8', title: 'Venue booking confirmation', priority: 'High', assignee: 'SM', assigneeColor: 'bg-indigo-600' },
  ]
};

const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
        High: 'bg-red-100 text-red-600',
        Medium: 'bg-orange-100 text-orange-600',
        Low: 'bg-blue-100 text-blue-600'
    }[priority] || 'bg-gray-100';

    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colors}`}>{priority}</span>;
}

export default function TaskBoard() {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
          <p className="text-gray-500 text-sm mt-1">Organize and track event tasks</p>
        </div>
        <button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {columns.map((col) => (
          <div key={col.id} className="min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col h-full border border-gray-100">
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700">{col.title}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">{col.count}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16}/></button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
                {tasks[col.id]?.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
                        <p className="text-sm font-medium text-gray-800 mb-3">{task.title}</p>
                        <div className="flex justify-between items-center">
                            <PriorityBadge priority={task.priority} />
                            <div className={`${task.assigneeColor} w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold`}>
                                {task.assignee}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* ADD TASK MODAL */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 shrink-0">
              <h2 className="text-xl font-medium text-gray-800">Add New Task</h2>
              <button 
                onClick={() => setIsAddTaskModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-2 space-y-5">
              
              {/* Task Title */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">Task Title *</label>
                <input 
                  type="text" 
                  placeholder="Enter task title" 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400" 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">Description</label>
                <textarea 
                  rows={4} 
                  placeholder="Enter task description (optional)" 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none placeholder:text-gray-400"
                ></textarea>
              </div>

              {/* Column */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">Column</label>
                <select 
                  defaultValue="To Do"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* Assignee & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Assignee (Initials) *</label>
                  <input 
                    type="text" 
                    placeholder="E.G., SM" 
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Priority</label>
                  <select 
                    defaultValue="Medium"
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 flex items-center gap-4 shrink-0 mt-2">
               <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                 Add Task
               </button>
               <button 
                  onClick={() => setIsAddTaskModalOpen(false)} 
                  className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
               >
                 Cancel
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}