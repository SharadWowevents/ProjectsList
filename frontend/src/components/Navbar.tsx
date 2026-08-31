import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Tag, 
  Download, 
  RotateCcw,
  Loader2 // <-- Added for loading state
} from 'lucide-react';
import { ProjectStats } from '../types';

interface NavbarProps {
  stats: ProjectStats;
  onOpenNewProject: () => void;
  onOpenManageTypes: () => void;
  onOpenImportExport: () => void;
  // Updated to support an async backend call for resetting the database
  onResetData: () => Promise<void> | void; 
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onOpenNewProject,
  onOpenManageTypes,
  onOpenImportExport,
  onResetData,
}) => {
  const [isResetting, setIsResetting] = useState(false);

  // Wrapper function to handle the async backend reset
  const handleResetClick = async () => {
    setIsResetting(true);
    try {
      await onResetData();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#E4E3E0]/95 backdrop-blur-md border-b border-[#141414]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xs bg-[#141414] flex items-center justify-center text-[#E4E3E0] shrink-0 border border-[#141414] shadow-xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-medium text-[#141414] tracking-tight truncate">
                  Projects Directory
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-semibold bg-white/70 text-[#141414] border border-[#141414]/20">
                  {stats.total.toString().padStart(2, '0')} {stats.total === 1 ? 'ENTRY' : 'ENTRIES'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#141414]/60 truncate hidden sm:block">
                CENTRAL REGISTRY // LIVE DEPLOYMENT STATUS // CLASSIFICATION
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Manage Types Button */}
            <button
              id="manage-types-button"
              onClick={onOpenManageTypes}
              disabled={isResetting}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#141414] bg-white/70 hover:bg-white border border-[#141414]/30 rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manage Project Types"
            >
              <Tag className="w-3.5 h-3.5 text-[#141414]/70" />
              <span className="hidden md:inline">Manage</span> Types
            </button>

            {/* Import / Export */}
            <button
              id="import-export-button"
              onClick={onOpenImportExport}
              disabled={isResetting}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#141414] bg-white/70 hover:bg-white border border-[#141414]/30 rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export CSV / JSON or Import Backup"
            >
              <Download className="w-3.5 h-3.5 text-[#141414]/70" />
              <span className="hidden lg:inline">Data</span> Export/Import
            </button>

            {/* Reset to Sample Data */}
            <button
              id="reset-sample-button"
              onClick={handleResetClick}
              disabled={isResetting}
              type="button"
              className="inline-flex items-center p-1.5 text-xs font-mono font-medium text-[#141414]/70 hover:text-[#141414] hover:bg-white/80 border border-[#141414]/20 rounded-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset to Sample Demo Projects"
            >
              {isResetting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#141414]" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
            </button>

            {/* New Project Primary CTA */}
            <button
              id="new-project-button"
              onClick={onOpenNewProject}
              disabled={isResetting}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#E4E3E0] bg-[#141414] hover:bg-[#262626] active:bg-black rounded-xs border border-[#141414] shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Project</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};