import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  LayoutList, 
  LayoutGrid, 
  ArrowUpDown,
  Loader2 // <-- Added for loading state
} from 'lucide-react';
import { FilterState, ProjectStatus, ProjectTypeItem, SortField, SortOrder } from '../types';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableTypes: ProjectTypeItem[];
  totalResults: number;
  totalProjects: number;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  isLoading?: boolean; // <-- Added to handle backend network latency
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableTypes,
  totalResults,
  totalProjects,
  viewMode,
  onViewModeChange,
  isLoading = false, // <-- Default to false
}) => {
  // Local state for debouncing the search input to prevent backend API spam
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Sync external filter resets (like clicking the "RESET" button) back to local state
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Trigger the actual filter change 300ms after the user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== localSearch) {
        onFilterChange({ search: localSearch });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, filters.search, onFilterChange]);

  const isFiltered = 
    filters.search !== '' ||
    filters.type !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.isLive !== 'ALL';

  return (
    <div className="bg-white/80 rounded-xs p-3 border border-[#141414]/20 shadow-2xs mb-4 space-y-2.5">
      
      {/* Top row: Search + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search input (Debounced) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#141414]/50">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="search-projects-input"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="FILTER BY PROJECT NAME, TYPE, URL, TAG OR KEYWORD..."
            className="w-full pl-8.5 pr-8 py-1.5 bg-white border border-[#141414]/25 focus:border-[#141414] focus:ring-1 focus:ring-[#141414] rounded-xs text-xs font-mono text-[#141414] placeholder-[#141414]/40 transition-all outline-none"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onFilterChange({ search: '' });
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#141414]/50 hover:text-[#141414]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle & Result Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          
          {/* Loading State or Matches Count */}
          <div className="text-[11px] font-mono text-[#141414]/70 font-medium flex items-center gap-1.5">
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#141414]" />
                <span>FETCHING...</span>
              </>
            ) : (
              <>
                MATCHES: <span className="font-bold text-[#141414]">{totalResults.toString().padStart(2, '0')}</span> / {totalProjects.toString().padStart(2, '0')}
              </>
            )}
          </div>

          <div className="inline-flex rounded-xs border border-[#141414]/25 p-0.5 bg-[#E4E3E0]/70">
            <button
              id="view-table-btn"
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xs text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#141414] text-[#E4E3E0] shadow-2xs'
                  : 'text-[#141414]/70 hover:text-[#141414]'
              }`}
              title="Table View (Dense column layout)"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              id="view-grid-btn"
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xs text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#141414] text-[#E4E3E0] shadow-2xs'
                  : 'text-[#141414]/70 hover:text-[#141414]'
              }`}
              title="Grid View (Visual Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Filter Row: Type, Status, Live, Sort, and Reset */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#141414]/10 text-xs font-mono">
        
        {/* Type Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase text-[#141414]/60">TYPE:</span>
          <select
            id="filter-type-select"
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            disabled={isLoading}
            className="bg-white border border-[#141414]/25 hover:border-[#141414] rounded-xs px-2 py-1 font-mono text-xs text-[#141414] focus:ring-1 focus:ring-[#141414] outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="ALL">ALL TYPES</option>
            {availableTypes.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase text-[#141414]/60">STATUS:</span>
          <select
            id="filter-status-select"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as ProjectStatus | 'ALL' })}
            disabled={isLoading}
            className="bg-white border border-[#141414]/25 hover:border-[#141414] rounded-xs px-2 py-1 font-mono text-xs text-[#141414] focus:ring-1 focus:ring-[#141414] outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Active">ACTIVE</option>
            <option value="In progress">IN PROGRESS</option>
            <option value="Inactive">INACTIVE</option>
          </select>
        </div>

        {/* Live Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase text-[#141414]/60">DEPLOY:</span>
          <select
            id="filter-live-select"
            value={filters.isLive}
            onChange={(e) => onFilterChange({ isLive: e.target.value as 'ALL' | 'LIVE' | 'OFFLINE' })}
            disabled={isLoading}
            className="bg-white border border-[#141414]/25 hover:border-[#141414] rounded-xs px-2 py-1 font-mono text-xs text-[#141414] focus:ring-1 focus:ring-[#141414] outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="ALL">ALL DEPLOYS</option>
            <option value="LIVE">LIVE ONLY</option>
            <option value="OFFLINE">NOT LIVE / OFFLINE</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3 h-3 text-[#141414]/50" />
          <span className="text-[11px] font-bold uppercase text-[#141414]/60">SORT:</span>
          <select
            id="sort-select"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [SortField, SortOrder];
              onFilterChange({ sortBy, sortOrder });
            }}
            disabled={isLoading}
            className="bg-white border border-[#141414]/25 hover:border-[#141414] rounded-xs px-2 py-1 font-mono text-xs text-[#141414] focus:ring-1 focus:ring-[#141414] outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="date-desc">DATE (NEWEST FIRST)</option>
            <option value="date-asc">DATE (OLDEST FIRST)</option>
            <option value="name-asc">NAME (A &rarr; Z)</option>
            <option value="name-desc">NAME (Z &rarr; A)</option>
            <option value="status-asc">STATUS</option>
            <option value="type-asc">TYPE</option>
            <option value="isLive-desc">LIVE STATUS</option>
          </select>
        </div>

        {/* Clear filters button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-[#141414] hover:underline font-bold px-2 py-1 rounded-xs bg-[#141414]/5 border border-[#141414]/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-3 h-3" />
            RESET
          </button>
        )}

      </div>

    </div>
  );
};