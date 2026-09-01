import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  FolderGit2, 
  Layers, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  ListFilter,
  XCircle
} from 'lucide-react';
import { 
  Project, 
  ProjectTypeItem, 
  FilterState, 
  ProjectStats, 
  ProjectStatus, 
  SortField, 
  SortOrder 
} from './types';
import { INITIAL_PROJECTS, DEFAULT_TYPES } from './data/initialData';

import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterControls } from './components/FilterControls';
import { ProjectTable } from './components/ProjectTable';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectModal } from './components/ProjectModal';
import { ManageTypesModal } from './components/ManageTypesModal';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { ImportExportModal } from './components/ImportExportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

// Set your backend URL here. In production, use environment variables (e.g., import.meta.env.VITE_API_URL)
const API_BASE_URL = 'http://localhost:5003/api';

export default function App() {
  // State: Projects & Custom Types
  const [projects, setProjects] = useState<Project[]>([]);
  const [types, setTypes] = useState<ProjectTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State: Filters & View
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    status: 'ALL',
    isLive: 'ALL',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // State: Modals & Drawers
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedDrawerProject, setSelectedDrawerProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Fetch initial data from backend on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [projectsRes, typesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects`),
          fetch(`${API_BASE_URL}/types`)
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setTypes(data);
        }
      } catch (err) {
        showToast('Failed to connect to backend server.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Toast notification helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '/' && !isNewProjectModalOpen && !isManageTypesOpen) {
        e.preventDefault();
        const searchInput = document.getElementById('search-projects-input');
        searchInput?.focus();
      }
      if ((e.key === 'n' || e.key === 'N') && !isNewProjectModalOpen && !isManageTypesOpen && !editingProject) {
        e.preventDefault();
        setIsNewProjectModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewProjectModalOpen, isManageTypesOpen, editingProject]);

  // Compute live statistics
  const stats: ProjectStats = useMemo(() => {
    const total = projects.length;
    let live = 0;
    let offline = 0;
    let Completed = 0;
    let inProgress = 0;
    let inactive = 0;
    const typeCounts: Record<string, number> = {};

    projects.forEach((p) => {
      if (p.isLive) live++;
      else offline++;

      if (p.status === 'Completed') Completed++;
      else if (p.status === 'In progress') inProgress++;
      else if (p.status === 'Inactive') inactive++;

      if (p.type) {
        typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
      }
    });

    return { total, live, offline, Completed, inProgress, inactive, typeCounts };
  }, [projects]);

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchType = p.type.toLowerCase().includes(query);
          const matchLink = (p.link || '').toLowerCase().includes(query);
          const matchDesc = (p.description || '').toLowerCase().includes(query);
          const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(query));
          if (!matchName && !matchType && !matchLink && !matchDesc && !matchTags) return false;
        }
        if (filters.type !== 'ALL' && p.type !== filters.type) return false;
        if (filters.status !== 'ALL' && p.status !== filters.status) return false;
        if (filters.isLive === 'LIVE' && !p.isLive) return false;
        if (filters.isLive === 'OFFLINE' && p.isLive) return false;
        return true;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        if (filters.sortBy === 'name') return a.name.localeCompare(b.name) * order;
        if (filters.sortBy === 'type') return a.type.localeCompare(b.type) * order;
        if (filters.sortBy === 'status') return a.status.localeCompare(b.status) * order;
        if (filters.sortBy === 'isLive') return (Number(a.isLive) - Number(b.isLive)) * order;
        
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return (dateA - dateB) * order;
      });
  }, [projects, filters]);

  // Handler: Add custom type via API
  const handleAddNewType = useCallback(async (newTypeName: string, color = 'indigo') => {
    const trimmed = newTypeName.trim();
    if (!trimmed) return;
    
    // Check if exists locally first
    if (types.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) return;

    const response = await fetch(`${API_BASE_URL}/types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, color, isDefault: false }),
    });

    if (!response.ok) throw new Error('Failed to save type to server');
    
    const newTypeItem = await response.json();
    setTypes((prev) => [...prev, newTypeItem]);
    showToast(`Added type "${trimmed}"`);
  }, [types]);

  // Handler: Delete custom type via API
  const handleDeleteType = useCallback(async (typeId: string, typeName: string) => {
    const response = await fetch(`${API_BASE_URL}/types/${typeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete type from server');

    setTypes((prev) => prev.filter((t) => t.id !== typeId));
    showToast(`Deleted type "${typeName}"`);
  }, []);

  // Handler: Save Project via API
  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      // Edit existing
      const response = await fetch(`${API_BASE_URL}/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Failed to update project');
      const updatedProject = await response.json();

      setProjects((prev) => prev.map((p) => p.id === updatedProject.id ? updatedProject : p));
      
      if (selectedDrawerProject?.id === updatedProject.id) {
        setSelectedDrawerProject(updatedProject);
      }
      showToast(`Updated "${updatedProject.name}"`);
    } else {
      // Create new
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Failed to create project');
      const newProj = await response.json();

      setProjects((prev) => [newProj, ...prev]);
      showToast(`Added "${newProj.name}"`);
    }
  };

  // Handler: Delete Project via API
  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    
    const response = await fetch(`${API_BASE_URL}/projects/${deletingProject.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete project');

    const name = deletingProject.name;
    setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
    if (selectedDrawerProject?.id === deletingProject.id) {
      setSelectedDrawerProject(null);
    }
    setDeletingProject(null);
    showToast(`Deleted "${name}"`, 'info');
  };

  // Handler: Duplicate Project via API
  const handleDuplicateProject = async (project: Project) => {
    const duplicateData = {
      ...project,
      name: `${project.name} (Copy)`
    };
    // Remove properties that should not be sent in a POST request
    delete (duplicateData as any).id;
    delete (duplicateData as any).createdAt;
    delete (duplicateData as any).updatedAt;

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicateData),
    });

    if (!response.ok) throw new Error('Failed to duplicate project');
    const newProj = await response.json();

    setProjects((prev) => [newProj, ...prev]);
    showToast(`Duplicated "${project.name}"`);
  };

  // Handler: Toggle Live Status via API
  const handleToggleLive = async (project: Project) => {
    const updatedLive = !project.isLive;
    
    const response = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, isLive: updatedLive }),
    });

    if (!response.ok) throw new Error('Failed to update live status');
    const updatedProject = await response.json();

    setProjects((prev) => prev.map((p) => p.id === updatedProject.id ? updatedProject : p));
    if (selectedDrawerProject?.id === project.id) {
      setSelectedDrawerProject(updatedProject);
    }
    showToast(`"${project.name}" is now ${updatedLive ? 'Live' : 'Offline'}`);
  };

  // Handler: Change Status via API
  const handleStatusChange = async (project: Project, newStatus: ProjectStatus) => {
    const response = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, status: newStatus }),
    });

    if (!response.ok) throw new Error('Failed to update status');
    const updatedProject = await response.json();

    setProjects((prev) => prev.map((p) => p.id === updatedProject.id ? updatedProject : p));
    if (selectedDrawerProject?.id === project.id) {
      setSelectedDrawerProject(updatedProject);
    }
    showToast(`Status updated to "${newStatus}"`);
  };

  // Handler: Table Header Sort
  const handleSort = (field: SortField) => {
    if (filters.sortBy === field) {
      setFilters((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      setFilters((prev) => ({ ...prev, sortBy: field, sortOrder: field === 'name' ? 'asc' : 'desc' }));
    }
  };

  // Handler: Import Data via API
  const handleImportData = async (
    importedProjects: Project[],
    importedTypes?: ProjectTypeItem[],
    replaceExisting = false
  ) => {
    // Note: For a robust implementation, your backend should ideally handle the "replace" logic 
    // or provide a bulk upsert endpoint. Here we use the /import endpoint we defined earlier.
    const response = await fetch(`${API_BASE_URL}/projects/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importedProjects),
    });

    if (!response.ok) throw new Error('Failed to import data to server');
    
    // Refetch everything to ensure frontend is fully in sync with backend
    const [projectsRes, typesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/projects`),
      fetch(`${API_BASE_URL}/types`)
    ]);

    if (projectsRes.ok) setProjects(await projectsRes.json());
    if (typesRes.ok) setTypes(await typesRes.json());

    showToast('Import completed successfully!');
  };

  // Handler: Reset to Sample Demo Data (Clear and Insert)
  const handleResetSampleData = async () => {
    if (window.confirm('Reset dashboard with realistic sample demo projects? This will append demo data to your database.')) {
      try {
        await fetch(`${API_BASE_URL}/projects/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(INITIAL_PROJECTS),
        });

        // Insert default types sequentially
        for (const t of DEFAULT_TYPES) {
          await fetch(`${API_BASE_URL}/types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t),
          });
        }

        // Refetch to sync state
        const [projectsRes, typesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects`),
          fetch(`${API_BASE_URL}/types`)
        ]);

        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (typesRes.ok) setTypes(await typesRes.json());

        setFilters({ search: '', type: 'ALL', status: 'ALL', isLive: 'ALL', sortBy: 'date', sortOrder: 'desc' });
        showToast('Appended demo sample projects!');
      } catch (err) {
        showToast('Failed to reset sample data', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col selection:bg-[#141414] selection:text-[#E4E3E0]">
      
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xs bg-[#141414] text-[#E4E3E0] shadow-xl text-xs font-mono border border-[#141414]">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'info' && <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />}
            {toastMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Application Navbar */}
      <Navbar
        stats={stats}
        onOpenNewProject={() => {
          setEditingProject(null);
          setIsNewProjectModalOpen(true);
        }}
        onOpenManageTypes={() => setIsManageTypesOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetData={handleResetSampleData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        
        {/* Statistics & Overview Banner */}
        <StatsBanner
          isLoading={isLoading}
          stats={stats}
          selectedType={filters.type}
          onSelectType={(typeName) => setFilters((prev) => ({ ...prev, type: typeName }))}
          onSelectStatus={(statusVal) => setFilters((prev) => ({ ...prev, status: statusVal }))}
          onSelectLive={(liveVal) => setFilters((prev) => ({ ...prev, isLive: liveVal }))}
        />

        {/* Filter, Search & View Controls */}
        <FilterControls
          isLoading={isLoading}
          filters={filters}
          onFilterChange={(newPartial) => setFilters((prev) => ({ ...prev, ...newPartial }))}
          onResetFilters={() => setFilters({ search: '', type: 'ALL', status: 'ALL', isLive: 'ALL', sortBy: 'date', sortOrder: 'desc' })}
          availableTypes={types}
          totalResults={filteredProjects.length}
          totalProjects={projects.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Project View: Table (Default) or Cards */}
        {viewMode === 'table' ? (
          <ProjectTable
            projects={filteredProjects}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={handleSort}
            onEditProject={(p) => {
              setEditingProject(p);
              setIsNewProjectModalOpen(true);
            }}
            onDeleteProject={(p) => setDeletingProject(p)}
            onDuplicateProject={handleDuplicateProject}
            onToggleLive={handleToggleLive}
            onStatusChange={handleStatusChange}
            onSelectProject={(p) => setSelectedDrawerProject(p)}
            onFilterByType={(typeName) => setFilters((prev) => ({ ...prev, type: typeName }))}
            onOpenNewProject={() => {
              setEditingProject(null);
              setIsNewProjectModalOpen(true);
            }}
          />
        ) : (
          <ProjectGrid
            projects={filteredProjects}
            onEditProject={(p) => {
              setEditingProject(p);
              setIsNewProjectModalOpen(true);
            }}
            onDeleteProject={(p) => setDeletingProject(p)}
            onDuplicateProject={handleDuplicateProject}
            onToggleLive={handleToggleLive}
            onStatusChange={handleStatusChange}
            onSelectProject={(p) => setSelectedDrawerProject(p)}
            onFilterByType={(typeName) => setFilters((prev) => ({ ...prev, type: typeName }))}
            onOpenNewProject={() => {
              setEditingProject(null);
              setIsNewProjectModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Footer Info */}
      <footer className="border-t border-[#141414]/15 bg-[#E4E3E0] py-3.5 mt-10 text-center text-xs text-[#141414]/70 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PROJECTS DIRECTORY &bull; DATA PERSISTED TO BACKEND API</span>
          <div className="flex items-center gap-3">
            <span>SHORTCUTS: <kbd className="px-1.5 py-0.5 bg-white border border-[#141414]/30 rounded-xs text-[10px] font-mono shadow-2xs">N</kbd> NEW PROJECT &bull; <kbd className="px-1.5 py-0.5 bg-white border border-[#141414]/30 rounded-xs text-[10px] font-mono shadow-2xs">/</kbd> SEARCH</span>
          </div>
        </div>
      </footer>

      {/* Project Add / Edit Modal */}
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => {
          setIsNewProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        projectToEdit={editingProject}
        availableTypes={types}
        onAddNewType={handleAddNewType}
      />

      {/* Manage Types Modal */}
      <ManageTypesModal
        isOpen={isManageTypesOpen}
        onClose={() => setIsManageTypesOpen(false)}
        types={types}
        projects={projects}
        onAddType={handleAddNewType}
        onDeleteType={handleDeleteType}
      />

      {/* Project Detail Slide-over Drawer */}
      <ProjectDetailDrawer
        project={selectedDrawerProject}
        onClose={() => setSelectedDrawerProject(null)}
        onEdit={(p) => {
          setSelectedDrawerProject(null);
          setEditingProject(p);
          setIsNewProjectModalOpen(true);
        }}
        onDelete={(p) => {
          setSelectedDrawerProject(null);
          setDeletingProject(p);
        }}
        onToggleLive={handleToggleLive}
        onDuplicate={handleDuplicateProject}
      />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        projects={projects}
        types={types}
        onImportData={handleImportData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        project={deletingProject}
      />

    </div>
  );
}