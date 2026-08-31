import React, { useState } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CopyCheck, 
  Calendar, 
  Layers,
  ChevronDown,
  Loader2 // <-- Added for loading states
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';
import { 
  getTypeBadgeStyle, 
  getStatusBadgeStyle, 
  getDisplayUrl, 
  normalizeUrl, 
  formatDeploymentDate 
} from '../utils/helpers';

interface ProjectGridProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  // Updated to support async operations for backend API calls
  onDuplicateProject: (project: Project) => Promise<void> | void;
  onToggleLive: (project: Project) => Promise<void> | void;
  onStatusChange: (project: Project, newStatus: ProjectStatus) => Promise<void> | void;
  
  onSelectProject: (project: Project) => void;
  onFilterByType: (type: string) => void;
  onOpenNewProject: () => void;
}

// Type to track which specific action on which project is currently processing
type ProcessingAction = 'live' | 'status' | 'duplicate';

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleLive,
  onStatusChange,
  onSelectProject,
  onFilterByType,
  onOpenNewProject,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Track backend request states per project ID to prevent freezing the whole grid
  const [processingTasks, setProcessingTasks] = useState<Record<string, ProcessingAction>>({});

  const setProcessing = (id: string, action: ProcessingAction | null) => {
    setProcessingTasks(prev => {
      const next = { ...prev };
      if (action) {
        next[id] = action;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const handleCopyLink = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!project.link) return;
    navigator.clipboard.writeText(normalizeUrl(project.link));
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Async wrappers for backend actions
  const handleToggleLiveClick = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProcessing(project.id, 'live');
    try {
      await onToggleLive(project);
    } finally {
      setProcessing(project.id, null);
    }
  };

  const handleStatusChangeClick = async (e: React.ChangeEvent<HTMLSelectElement>, project: Project) => {
    e.stopPropagation();
    const newStatus = e.target.value as ProjectStatus;
    setProcessing(project.id, 'status');
    try {
      await onStatusChange(project, newStatus);
    } finally {
      setProcessing(project.id, null);
    }
  };

  const handleDuplicateClick = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProcessing(project.id, 'duplicate');
    try {
      await onDuplicateProject(project);
    } finally {
      setProcessing(project.id, null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white/95 rounded-xs border border-[#141414]/20 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-xs bg-[#141414]/5 border border-[#141414]/15 flex items-center justify-center mx-auto mb-3 text-[#141414]">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif font-medium text-[#141414] mb-1">No Matching Projects</h3>
        <p className="text-xs font-mono text-[#141414]/60 max-w-md mx-auto mb-6">
          No projects matched your active filters or search terms.
        </p>
        <button
          type="button"
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#252525] text-[#E4E3E0] text-xs font-mono font-bold uppercase tracking-wider rounded-xs border border-[#141414] shadow-xs transition-all cursor-pointer"
        >
          <span>Add New Project</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {projects.map((project, idx) => {
        const typeStyle = getTypeBadgeStyle(project.type);
        const statusStyle = getStatusBadgeStyle(project.status);
        const isCopied = copiedId === project.id;
        const hasLink = Boolean(project.link && project.link.trim());
        const fullUrl = hasLink ? normalizeUrl(project.link) : '#';

        // Check loading states for this specific card
        const currentTask = processingTasks[project.id];
        const isTogglingLive = currentTask === 'live';
        const isChangingStatus = currentTask === 'status';
        const isDuplicating = currentTask === 'duplicate';

        return (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="bg-white/95 rounded-xs border border-[#141414]/20 hover:border-[#141414] p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            {/* Header: Index, Type and Live Badge */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                
                {/* Type Badge with sequence counter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-[#141414]/40 font-semibold">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterByType(project.type);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-xs font-mono font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                    <span>{project.type}</span>
                  </button>
                </div>

                {/* Live or Not Quick Toggle */}
                <button
                  type="button"
                  disabled={isTogglingLive}
                  onClick={(e) => handleToggleLiveClick(e, project)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-xs font-mono font-medium border transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    project.isLive
                      ? 'bg-emerald-500/10 text-emerald-950 border-emerald-700/30 hover:bg-emerald-500/20'
                      : 'bg-[#141414]/5 text-[#141414]/70 border-[#141414]/20 hover:bg-[#141414]/10'
                  }`}
                  title="Click to toggle Live status"
                >
                  {isTogglingLive ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#141414]/70" />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        project.isLive ? 'bg-emerald-600 animate-pulse' : 'bg-[#141414]/40'
                      }`}
                    />
                  )}
                  <span>{project.isLive ? 'LIVE' : 'OFFLINE'}</span>
                </button>
              </div>

              {/* Title & Description */}
              <h3 className="font-serif text-lg font-medium text-[#141414] group-hover:underline transition-colors line-clamp-1 mb-1">
                {project.name}
              </h3>
              <p className="text-xs text-[#141414]/65 line-clamp-2 min-h-[32px] mb-3 leading-relaxed">
                {project.description || 'No description provided.'}
              </p>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx}
                      className="text-[10px] font-mono text-[#141414]/70 bg-[#141414]/5 border border-[#141414]/15 px-1.5 py-0.2 rounded-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Meta & Actions */}
            <div className="pt-2.5 border-t border-[#141414]/10 space-y-2 text-xs">
              
              {/* Project Link */}
              <div className="flex items-center justify-between gap-2 font-mono">
                <span className="text-[#141414]/50 text-[11px] uppercase font-bold shrink-0">LINK:</span>
                {hasLink ? (
                  <div className="flex items-center gap-1 min-w-0">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#141414] hover:underline font-mono truncate flex items-center gap-1"
                    >
                      <span className="truncate max-w-[150px]">{getDisplayUrl(project.link)}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 text-[#141414]/60" />
                    </a>
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(e, project)}
                      className="p-1 text-[#141414]/50 hover:text-[#141414] hover:bg-white rounded-xs border border-transparent hover:border-[#141414]/20 transition-colors"
                      title="Copy link"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-[#141414]/40 italic font-mono">NO LINK</span>
                )}
              </div>

              {/* Date & Status */}
              <div className="flex items-center justify-between gap-2 font-mono">
                <div className="flex items-center gap-1 text-[#141414]/75 text-[11px]">
                  <Calendar className="w-3 h-3 text-[#141414]/40" />
                  <span>{formatDeploymentDate(project.date)}</span>
                </div>

                <div className="relative inline-flex items-center">
                  {isChangingStatus && (
                    <Loader2 className="w-3 h-3 animate-spin text-[#141414]/60 absolute left-1 pointer-events-none" />
                  )}
                  <select
                    aria-label="Update project status"
                    value={project.status}
                    disabled={isChangingStatus}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChangeClick(e, project)}
                    className={`appearance-none text-xs font-mono font-medium rounded-xs pr-5 py-0.5 border outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isChangingStatus ? 'pl-5' : 'pl-2'
                    } ${statusStyle.bg}`}
                  >
                    <option value="Active" className="bg-white text-[#141414]">Active</option>
                    <option value="In progress" className="bg-white text-[#141414]">In progress</option>
                    <option value="Inactive" className="bg-white text-[#141414]">Inactive</option>
                  </select>
                  {!isChangingStatus && (
                    <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-end gap-1 pt-2 border-t border-[#141414]/10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProject(project);
                  }}
                  className="p-1 text-[#141414]/60 hover:text-[#141414] hover:bg-white rounded-xs border border-transparent hover:border-[#141414]/20 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isDuplicating}
                  onClick={(e) => handleDuplicateClick(e, project)}
                  className="p-1 text-[#141414]/60 hover:text-[#141414] hover:bg-white rounded-xs border border-transparent hover:border-[#141414]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Duplicate"
                >
                  {isDuplicating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CopyCheck className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project);
                  }}
                  className="p-1 text-rose-700/60 hover:text-rose-800 hover:bg-rose-50 rounded-xs border border-transparent hover:border-rose-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
};