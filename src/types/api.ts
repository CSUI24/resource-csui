import type { ResourceFile } from "./file";
import type { Folder } from "./folder";
import type { SessionUser } from "./user";

export interface ApiErrorBody {
  error: string;
}

export interface SessionResponse {
  user: SessionUser | null;
}

export interface FoldersResponse {
  folders: Folder[];
}

export interface FolderResponse {
  folder: Folder;
}

export interface BreadcrumbsResponse {
  breadcrumbs: Folder[];
}

export interface FilesResponse {
  files: ResourceFile[];
}

export interface FileResponse {
  file: ResourceFile;
}

export interface SearchResponse {
  folders: Folder[];
  files: ResourceFile[];
}
