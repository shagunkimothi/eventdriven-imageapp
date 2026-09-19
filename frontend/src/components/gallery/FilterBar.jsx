import React from 'react';
import { Search } from 'lucide-react';

export const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange, 
  sortBy, 
  onSortByChange,
  totalCount 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by filename or label..."
          className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1">
        {[
          { id: 'ALL', label: `All (${totalCount})` },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'PROCESSING', label: 'Processing' },
          { id: 'FAILED', label: 'Failed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onStatusFilterChange(tab.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              statusFilter === tab.id
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort Select */}
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="newest">Newest</option>
        <option value="reduction">Highest Reduction</option>
        <option value="size">Largest Original</option>
      </select>

    </div>
  );
};
