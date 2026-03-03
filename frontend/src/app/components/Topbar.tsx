import { Search, Plus, Bell, MenuIcon } from "lucide-react";

interface TopbarProps {
  toggleSidebar: () => void;
}

export default function Topbar({ toggleSidebar }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">

  {/* Left section */}
  <div className="flex items-center gap-3 flex-1">
    <button className="md:hidden" onClick={toggleSidebar}>
      <MenuIcon />
    </button>

    {/* Search */}
    <div className="relative hidden sm:block w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />
      <input
        type="text"
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
    </div>
  </div>

  {/* Right Actions */}
  <div className="flex items-center gap-3 md:gap-4">

    {/* Hide text on small screens */}
    <button className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
      <Plus size={16} />
      <span className="hidden md:inline">Create New Event</span>
    </button>

    <div className="relative">
      <Bell className="text-gray-600" size={20} />
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
    </div>

    {/* Hide name on small screens */}
    <div className="flex items-center gap-3 border-l pl-3 md:pl-4 border-gray-200">
      <div className="text-right hidden md:block">
        <p className="text-sm font-medium text-gray-900">Sarah Mitchell</p>
        <p className="text-xs text-gray-500">Chairperson</p>
      </div>
      <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
        SM
      </div>
    </div>

  </div>
</header>
  );
}