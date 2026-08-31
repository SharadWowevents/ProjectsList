import React, { useState } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CopyCheck, 
  Globe, 
  Calendar, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Layers,
  ChevronDown,
  Loader2 // <-- Added for loading states
} from 'lucide-react';
import { Project, ProjectStatus, SortField, SortOrder } from '../types';
import { 
  getTypeBadgeStyle, 
  getStatusBadgeStyle, 
  getDisplayUrl, 
  normalizeUrl, 
  formatDeploymentDate, 
  getRelativeTime 
} from '../utils/helpers';

interface ProjectTableProps {
  projects: Project[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
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

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  sortBy,
  sortOrder,
  onSort,
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
  
  // Track backend request states per project ID to prevent freezing the whole table
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
    const fullUrl = normalizeUrl(project.link);
    navigator.clipboard.writeText(fullUrl);
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

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#141414]/30 group-hover:text-[#141414] transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#141414]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#141414]" />
    );
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white/95 rounded-xs border border-[#141414]/20 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-xs bg-[#141414]/5 border border-[#141414]/15 flex items-center justify-center mx-auto mb-3 text-[#141414]">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif font-medium text-[#141414] mb-1">No Matching Projects</h3>
        <p className="text-xs font-mono text-[#141414]/60 max-w-md mx-auto mb-6">
          No projects matched your active filters or search terms. You can clear filters or register a new project.
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
    <div className="bg-white/95 rounded-xs border border-[#141414]/25 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          
          {/* Table Header with Required Columns */}
          <thead>
            <tr className="bg-[#E4E3E0] border-b border-[#141414]/25 text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]/75 select-none">
              
              {/* Column 1: Name */}
              <th 
                scope="col"
                onClick={() => onSort('name')}
                className="py-2.5 px-3.5 sm:px-4 cursor-pointer group hover:bg-[#141414]/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>PROJECT NAME</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Column 2: Type */}
              <th 
                scope="col"
                onClick={() => onSort('type')}
                className="py-2.5 px-3 sm:px-4 cursor-pointer group hover:bg-[#141414]/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>TYPE</span>
                  {renderSortIcon('type')}
                </div>
              </th>

              {/* Column 3: Link of the project */}
              <th scope="col" className="py-2.5 px-3 sm:px-4">
                <span>LINK / URL</span>
              </th>

              {/* Column 4: Live or not */}
              <th 
                scope="col"
                onClick={() => onSort('isLive')}
                className="py-2.5 px-3 sm:px-4 cursor-pointer group hover:bg-[#141414]/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>LIVE OR NOT</span>
                  {renderSortIcon('isLive')}
                </div>
              </th>

              {/* Column 5: Date of Deployment/Development */}
              <th 
                scope="col"
                onClick={() => onSort('date')}
                className="py-2.5 px-3 sm:px-4 cursor-pointer group hover:bg-[#141414]/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>DATE OF DEPLOYMENT</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* Column 6: Status */}
              <th 
                scope="col"
                onClick={() => onSort('status')}
                className="py-2.5 px-3 sm:px-4 cursor-pointer group hover:bg-[#141414]/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>STATUS</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Column 7: Actions */}
              <th scope="col" className="py-2.5 px-3 sm:px-4 text-right pr-4">
                <span>ACTIONS</span>
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#141414]/15 text-xs">
            {projects.map((project, index) => {
              const typeStyle = getTypeBadgeStyle(project.type);
              const statusStyle = getStatusBadgeStyle(project.status);
              const relativeTime = getRelativeTime(project.date);
              const isCopied = copiedId === project.id;
              const hasLink = Boolean(project.link && project.link.trim());
              const fullUrl = hasLink ? normalizeUrl(project.link) : '#';

              // Check loading states for this specific row
              const currentTask = processingTasks[project.id];
              const isTogglingLive = currentTask === 'live';
              const isChangingStatus = currentTask === 'status';
              const isDuplicating = currentTask === 'duplicate';

              return (
                <tr
                  key={project.id}
                  id={`project-row-${project.id}`}
                  onClick={() => onSelectProject(project)}
                  className="hover:bg-[#E4E3E0]/35 transition-colors cursor-pointer group"
                >
                  
                  {/* Column 1: Name */}
                  <td className="py-2.5 px-3.5 sm:px-4 align-middle">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[10px] text-[#141414]/40 mt-1 shrink-0 font-semibold">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif text-base font-medium text-[#141414] group-hover:underline transition-colors line-clamp-1">
                          {project.name}
                        </span>
                        {project.description && (
                          <p className="text-[11px] text-[#141414]/65 line-clamp-1 mt-0.5 max-w-sm">
                            {project.description}
                          </p>
                        )}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.tags.slice(0, 3).map((tag, idx) => (
                              <span 
                                key={idx}
                                className="text-[10px] font-mono text-[#141414]/70 bg-[#141414]/5 border border-[#141414]/15 px-1.5 py-0.2 rounded-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="text-[10px] font-mono text-[#141414]/40 font-medium">
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Type (Dashboard, Tracker, Calculator, etc.) */}
                  <td className="py-2.5 px-3 sm:px-4 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterByType(project.type);
                      }}
                      title={`Filter by ${project.type}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-xs font-mono font-medium border transition-all cursor-pointer ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} hover:bg-white`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                      <span>{project.type}</span>
                    </button>
                  </td>

                  {/* Column 3: Link of the project */}
                  <td className="py-2.5 px-3 sm:px-4 align-middle">
                    {hasLink ? (
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-mono text-[#141414] hover:underline truncate max-w-[170px] sm:max-w-[210px]"
                          title={fullUrl}
                        >
                          <span className="truncate">{getDisplayUrl(project.link)}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-[#141414]/60" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(e, project)}
                          title="Copy project link"
                          className="p-1 rounded-xs text-[#141414]/50 hover:text-[#141414] hover:bg-white border border-transparent hover:border-[#141414]/20 transition-colors shrink-0 cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[#141414]/40 italic">NO LINK</span>
                    )}
                  </td>

                  {/* Column 4: Live or not */}
                  <td className="py-2.5 px-3 sm:px-4 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isTogglingLive}
                      onClick={(e) => handleToggleLiveClick(e, project)}
                      title="Click to toggle Live status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-xs font-mono font-medium border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        project.isLive
                          ? 'bg-emerald-500/10 text-emerald-950 border-emerald-700/30 hover:bg-emerald-500/20'
                          : 'bg-[#141414]/5 text-[#141414]/70 border-[#141414]/20 hover:bg-[#141414]/10'
                      }`}
                    >
                      {isTogglingLive ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#141414]/70" />
                      ) : (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            project.isLive
                              ? 'bg-emerald-600 animate-pulse'
                              : 'bg-[#141414]/40'
                          }`}
                        />
                      )}
                      <span>{project.isLive ? 'LIVE' : 'NOT LIVE'}</span>
                    </button>
                  </td>

                  {/* Column 5: Date of Deployment/Development */}
                  <td className="py-2.5 px-3 sm:px-4 align-middle whitespace-nowrap">
                    <div className="flex flex-col font-mono text-xs text-[#141414]/85">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#141414]/40" />
                        {formatDeploymentDate(project.date)}
                      </span>
                      {relativeTime && (
                        <span className="text-[10px] text-[#141414]/50">
                          {relativeTime}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Status */}
                  <td className="py-2.5 px-3 sm:px-4 align-middle whitespace-nowrap">
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
                        className={`appearance-none text-xs font-mono font-medium rounded-xs pr-5 py-0.5 border transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          isChangingStatus ? 'pl-5' : 'pl-2.5'
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
                  </td>

                  {/* Column 7: Actions */}
                  <td className="py-2.5 px-3 sm:px-4 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      
                      {/* Edit Button */}
                      <button
                        id={`edit-btn-${project.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProject(project);
                        }}
                        title="Edit Project"
                        className="p-1 text-[#141414]/60 hover:text-[#141414] hover:bg-white rounded-xs border border-transparent hover:border-[#141414]/20 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        disabled={isDuplicating}
                        onClick={(e) => handleDuplicateClick(e, project)}
                        title="Duplicate Project"
                        className="p-1 text-[#141414]/60 hover:text-[#141414] hover:bg-white rounded-xs border border-transparent hover:border-[#141414]/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDuplicating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CopyCheck className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        id={`delete-btn-${project.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project);
                        }}
                        title="Delete Project"
                        className="p-1 text-rose-700/60 hover:text-rose-800 hover:bg-rose-50 rounded-xs border border-transparent hover:border-rose-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Table bottom ledger summary */}
      <div className="bg-[#E4E3E0]/70 border-t border-[#141414]/20 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#141414]/70">
        <div>
          REGISTRY COUNT: <span className="font-bold text-[#141414]">{projects.length.toString().padStart(2, '0')}</span> RECORD{projects.length !== 1 ? 'S' : ''}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            LIVE: {projects.filter((p) => p.isLive).length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            DEV: {projects.filter((p) => p.status === 'In progress').length}
          </span>
        </div>
      </div>

    </div>
  );
};