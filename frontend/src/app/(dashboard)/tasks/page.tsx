"use client";

import { MoreHorizontal } from "lucide-react";

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
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
        <p className="text-gray-500 text-sm">Organize and track event tasks</p>
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
    </div>
  );
}