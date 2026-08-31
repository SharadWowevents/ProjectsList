export type ProjectStatus = 'Active' | 'Inactive' | 'In progress';

export interface ProjectTypeItem {
  id: string;
  name: string;
  color?: string; // Tailwind color token or hex
  isDefault?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: string; // Dashboard, Tracker, Calculator, or custom type
  link: string;
  isLive: boolean; // Live or not
  date: string; // Date of Deployment/Development (YYYY-MM-DD)
  status: ProjectStatus; // Active | Inactive | In progress
  tags?: string[];
  techStack?: string[];
  githubUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'date' | 'name' | 'status' | 'isLive' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  type: string; // 'ALL' or specific type
  status: ProjectStatus | 'ALL';
  isLive: 'ALL' | 'LIVE' | 'OFFLINE';
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface ProjectStats {
  total: number;
  live: number;
  offline: number;
  active: number;
  inProgress: number;
  inactive: number;
  typeCounts: Record<string, number>;
}
