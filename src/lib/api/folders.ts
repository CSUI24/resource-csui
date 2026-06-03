import type { BreadcrumbsResponse, FolderResponse, FoldersResponse } from "@/types/api";

import { apiFetch } from "./client";

export function getFolders(parentId: string | null) {
  const params = parentId ? `?parentId=${encodeURIComponent(parentId)}` : "";
  return apiFetch<FoldersResponse>(`/api/folders${params}`);
}

export function getFolder(folderId: string) {
  return apiFetch<FolderResponse & BreadcrumbsResponse>(`/api/folders/${folderId}`);
}

export function createFolder(input: { name: string; parentId: string | null }) {
  return apiFetch<FolderResponse>("/api/folders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function renameFolder(folderId: string, name: string) {
  return apiFetch<FolderResponse>(`/api/folders/${folderId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteFolder(folderId: string) {
  return apiFetch<{ ok: true }>(`/api/folders/${folderId}`, {
    method: "DELETE",
  });
}
