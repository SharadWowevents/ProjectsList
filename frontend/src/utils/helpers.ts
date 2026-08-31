import { Project, ProjectStatus, ProjectTypeItem } from '../types';
import { DEFAULT_TYPES, INITIAL_PROJECTS } from '../data/initialData';

const STORAGE_PROJECTS_KEY = 'user_projects_directory_v1';
const STORAGE_TYPES_KEY = 'user_project_types_v1';

// Load stored projects or initialize with default sample projects
export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Failed to load projects from localStorage', err);
    return INITIAL_PROJECTS;
  }
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
}

// Load stored project types or initialize with defaults
export function getStoredTypes(): ProjectTypeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_TYPES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_TYPES_KEY, JSON.stringify(DEFAULT_TYPES));
      return DEFAULT_TYPES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TYPES;
  } catch (err) {
    console.error('Failed to load types from localStorage', err);
    return DEFAULT_TYPES;
  }
}

export function saveStoredTypes(types: ProjectTypeItem[]): void {
  try {
    localStorage.setItem(STORAGE_TYPES_KEY, JSON.stringify(types));
  } catch (err) {
    console.error('Failed to save types to localStorage', err);
  }
}

// Color palette mapping for type badges in High Density theme
export const TYPE_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  Dashboard: {
    bg: 'bg-[#141414]/5',
    text: 'text-[#141414]',
    border: 'border-[#141414]/20',
    dot: 'bg-[#141414]',
    glow: 'group-hover:shadow-xs',
  },
  Tracker: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-950',
    border: 'border-emerald-700/30',
    dot: 'bg-emerald-700',
    glow: 'group-hover:shadow-xs',
  },
  Calculator: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-950',
    border: 'border-amber-700/30',
    dot: 'bg-amber-700',
    glow: 'group-hover:shadow-xs',
  },
  'AI Tool': {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-950',
    border: 'border-indigo-700/30',
    dot: 'bg-indigo-700',
    glow: 'group-hover:shadow-xs',
  },
  Portfolio: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-950',
    border: 'border-sky-700/30',
    dot: 'bg-sky-700',
    glow: 'group-hover:shadow-xs',
  },
  Utility: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-950',
    border: 'border-rose-700/30',
    dot: 'bg-rose-700',
    glow: 'group-hover:shadow-xs',
  },
};

export function getTypeBadgeStyle(typeName: string) {
  if (TYPE_COLOR_MAP[typeName]) {
    return TYPE_COLOR_MAP[typeName];
  }
  // Generate consistent hash-based color for user custom types
  const palette = [
    { bg: 'bg-teal-500/10', text: 'text-teal-950', border: 'border-teal-700/30', dot: 'bg-teal-700', glow: 'shadow-xs' },
    { bg: 'bg-blue-500/10', text: 'text-blue-950', border: 'border-blue-700/30', dot: 'bg-blue-700', glow: 'shadow-xs' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-950', border: 'border-fuchsia-700/30', dot: 'bg-fuchsia-700', glow: 'shadow-xs' },
    { bg: 'bg-orange-500/10', text: 'text-orange-950', border: 'border-orange-700/30', dot: 'bg-orange-700', glow: 'shadow-xs' },
    { bg: 'bg-cyan-500/10', text: 'text-cyan-950', border: 'border-cyan-700/30', dot: 'bg-cyan-700', glow: 'shadow-xs' },
    { bg: 'bg-violet-500/10', text: 'text-violet-950', border: 'border-violet-700/30', dot: 'bg-violet-700', glow: 'shadow-xs' },
  ];
  let hash = 0;
  for (let i = 0; i < typeName.length; i++) {
    hash = typeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

// Status styles in High Density theme
export function getStatusBadgeStyle(status: ProjectStatus) {
  switch (status) {
    case 'Active':
      return {
        bg: 'bg-emerald-500/10 text-emerald-900 border-emerald-700/30',
        dot: 'bg-emerald-600',
        label: 'Active',
      };
    case 'In progress':
      return {
        bg: 'bg-amber-500/10 text-amber-900 border-amber-700/30',
        dot: 'bg-amber-600',
        label: 'In progress',
      };
    case 'Inactive':
      return {
        bg: 'bg-[#141414]/5 text-[#141414]/70 border-[#141414]/20',
        dot: 'bg-[#141414]/40',
        label: 'Inactive',
      };
    default:
      return {
        bg: 'bg-[#141414]/5 text-[#141414]/70 border-[#141414]/20',
        dot: 'bg-[#141414]/40',
        label: status,
      };
  }
}

// Normalize URL with https:// if protocol missing
export function normalizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// Format display URL (clean domain + path without full protocol)
export function getDisplayUrl(url: string): string {
  if (!url) return 'No link provided';
  try {
    const full = normalizeUrl(url);
    const parsed = new URL(full);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return url.replace(/^https?:\/\//i, '');
  }
}

// Date formatter
export function formatDeploymentDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Relative time format
export function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    let target: Date;
    if (parts.length === 3) {
      target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      target = new Date(dateStr);
    }
    if (isNaN(target.getTime())) return '';

    const now = new Date();
    // Normalize both to start of day
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 0 && diffDays < 30) return `${diffDays}d ago`;
    if (diffDays > 0 && diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}mo ago`;
    }
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      return `${years}y ago`;
    }
    if (diffDays < 0) {
      return `In ${Math.abs(diffDays)}d`;
    }
    return '';
  } catch {
    return '';
  }
}

// Export projects as CSV
export function exportProjectsToCSV(projects: Project[]): void {
  const headers = ['Name', 'Type', 'Link', 'Live', 'Date of Deployment/Development', 'Status', 'Description', 'Notes', 'Tags'];
  const rows = projects.map(p => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.type || '').replace(/"/g, '""')}"`,
    `"${(p.link || '').replace(/"/g, '""')}"`,
    p.isLive ? 'Yes' : 'No',
    `"${(p.date || '').replace(/"/g, '""')}"`,
    `"${(p.status || '').replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    `"${(p.tags?.join(', ') || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `projects-export-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export projects as JSON
export function exportProjectsToJSON(projects: Project[], types: ProjectTypeItem[]): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    types,
    projects,
  };
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `projects-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
