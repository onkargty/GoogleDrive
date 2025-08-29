export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  mime_type?: string;
  path: string;
  parent_id?: string | null;
  owner_id: string;
  shared: boolean;
  starred: boolean;
  created_at: string;
  updated_at: string;
  file_url?: string;
  thumbnail_url?: string;
  owner?: User;
  shared_with?: SharedFile[];
}

export interface SharedFile {
  id: string;
  file_id: string;
  shared_with_user_id: string;
  permission: 'view' | 'edit' | 'admin';
  created_at: string;
  shared_with_user?: User;
}

export interface StorageUsage {
  used_bytes: number;
  total_bytes: number;
  file_count: number;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'modified' | 'size' | 'type';
export type Permission = 'view' | 'edit' | 'admin';