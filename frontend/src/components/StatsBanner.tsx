import React from 'react';
import { 
  FolderKanban, 
  Radio, 
  Clock, 
  Layers,
  Activity,
} from 'lucide-react';
import { ProjectStats } from '../types';
import { getTypeBadgeStyle } from '../utils/helpers';

interface StatsBannerProps {
  stats: ProjectStats;
  selectedType: string;
  onSelectType: (type: string) => void;
  onSelectStatus: (status: 'Active' | 'In progress' | 'Inactive' | 'ALL') => void;
  onSelectLive: (live: 'ALL' | 'LIVE' | 'OFFLINE') => void;
  isLoading?: boolean; // <-- Added to handle initial backend fetch delay
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  selectedType,
  onSelectType,
  onSelectStatus,
  onSelectLive,
  isLoading = false, // <-- Default to false
}) => {
  const livePercentage = stats.total > 0 ? Math.round((stats.live / stats.total) * 100) : 0;

  return (
    <div className="space-y-3 mb-5">
      
      {/* Metric Cards Grid - High Density Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* Card 1: Total Projects */}
        <div 
          onClick={() => {
            onSelectType('ALL');
            onSelectStatus('ALL');
            onSelectLive('ALL');
          }}
          className="bg-white/90 rounded-xs p-3.5 sm:p-4 border border-[#141414]/20 hover:border-[#141414] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/60">
              SYS // TOTAL REPO
            </span>
            <div className="w-6 h-6 rounded-xs bg-[#141414]/5 flex items-center justify-center text-[#141414] group-hover:bg-[#141414] group-hover:text-[#E4E3E0] transition-colors border border-[#141414]/10">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-8 w-12 bg-[#141414]/10 animate-pulse rounded-xs" />
            ) : (
              <span className="text-2xl sm:text-3xl font-serif font-medium text-[#141414] tracking-tight">
                {stats.total.toString().padStart(2, '0')}
              </span>
            )}
            <span className="text-[11px] font-mono text-[#141414]/60 font-medium group-hover:text-[#141414]">
              VIEW ALL &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: Live Deployments */}
        <div 
          onClick={() => onSelectLive('LIVE')}
          className="bg-white/90 rounded-xs p-3.5 sm:p-4 border border-[#141414]/20 hover:border-emerald-800 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/60">
              NET // LIVE ONLINE
            </span>
            <div className="w-6 h-6 rounded-xs bg-emerald-500/10 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors border border-emerald-700/20">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-12 bg-emerald-900/10 animate-pulse rounded-xs" />
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-serif font-medium text-emerald-900 tracking-tight">
                    {stats.live.toString().padStart(2, '0')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-950 border border-emerald-700/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    {livePercentage}%
                  </span>
                </>
              )}
            </div>
            {isLoading ? (
              <div className="h-3 w-16 bg-[#141414]/10 animate-pulse rounded-xs" />
            ) : (
              <span className="text-[11px] font-mono text-emerald-800 font-medium group-hover:underline">
                {stats.offline} OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Card 3: In Progress Projects */}
        <div 
          onClick={() => onSelectStatus('In progress')}
          className="bg-white/90 rounded-xs p-3.5 sm:p-4 border border-[#141414]/20 hover:border-amber-800 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/60">
              DEV // IN PROGRESS
            </span>
            <div className="w-6 h-6 rounded-xs bg-amber-500/10 flex items-center justify-center text-amber-800 group-hover:bg-amber-800 group-hover:text-white transition-colors border border-amber-700/20">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-8 w-12 bg-amber-900/10 animate-pulse rounded-xs" />
            ) : (
              <span className="text-2xl sm:text-3xl font-serif font-medium text-amber-900 tracking-tight">
                {stats.inProgress.toString().padStart(2, '0')}
              </span>
            )}
            <span className="text-[11px] font-mono text-amber-800 font-medium group-hover:underline">
              ACTIVE SPRINT
            </span>
          </div>
        </div>

        {/* Card 4: Active Projects */}
        <div 
          onClick={() => onSelectStatus('Active')}
          className="bg-white/90 rounded-xs p-3.5 sm:p-4 border border-[#141414]/20 hover:border-[#141414] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/60">
              OPS // ACTIVE STATUS
            </span>
            <div className="w-6 h-6 rounded-xs bg-indigo-500/10 flex items-center justify-center text-indigo-800 group-hover:bg-indigo-900 group-hover:text-white transition-colors border border-indigo-700/20">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-8 w-12 bg-indigo-950/10 animate-pulse rounded-xs" />
            ) : (
              <span className="text-2xl sm:text-3xl font-serif font-medium text-indigo-950 tracking-tight">
                {stats.active.toString().padStart(2, '0')}
              </span>
            )}
            {isLoading ? (
              <div className="h-3 w-16 bg-[#141414]/10 animate-pulse rounded-xs" />
            ) : (
              <span className="text-[11px] font-mono text-[#141414]/60 font-medium">
                {stats.inactive} INACTIVE
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Category Type Distribution Quick-Bar */}
      {(!isLoading && Object.keys(stats.typeCounts).length > 0) && (
        <div className="bg-white/70 rounded-xs p-2.5 border border-[#141414]/20 shadow-2xs flex flex-wrap items-center gap-1.5 animate-in fade-in duration-300">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#141414]/70 flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5" />
            INDEX:
          </span>

          <button
            type="button"
            onClick={() => onSelectType('ALL')}
            className={`px-2.5 py-1 rounded-xs text-xs font-mono transition-all cursor-pointer border ${
              selectedType === 'ALL'
                ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-semibold'
                : 'bg-white/80 text-[#141414] border-[#141414]/20 hover:bg-white'
            }`}
          >
            ALL TYPES [{stats.total}]
          </button>

          {Object.entries(stats.typeCounts).map(([typeName, count]) => {
            const isSelected = selectedType === typeName;
            const style = getTypeBadgeStyle(typeName);

            return (
              <button
                key={typeName}
                type="button"
                onClick={() => onSelectType(typeName)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold shadow-xs'
                    : `${style.bg} ${style.text} ${style.border} hover:bg-white`
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#E4E3E0]' : style.dot}`} />
                <span>{typeName}</span>
                <span className="text-[10px] font-bold opacity-80">[{count}]</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading state for Quick-bar */}
      {isLoading && (
        <div className="bg-white/70 rounded-xs p-2.5 border border-[#141414]/20 shadow-2xs flex flex-wrap items-center gap-2">
          <div className="h-4 w-16 bg-[#141414]/10 animate-pulse rounded-xs" />
          <div className="h-6 w-24 bg-[#141414]/10 animate-pulse rounded-xs" />
          <div className="h-6 w-20 bg-[#141414]/10 animate-pulse rounded-xs" />
          <div className="h-6 w-24 bg-[#141414]/10 animate-pulse rounded-xs" />
        </div>
      )}

    </div>
  );
};