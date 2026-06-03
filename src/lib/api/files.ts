import type { FileResponse, FilesResponse } from "@/types/api";
import type { ResourceFileMetadata, UploadTicket } from "@/types/file";

import { apiFetch } from "./client";

export function getFiles(folderId: string | null) {
  if (!folderId) return Promise.resolve<FilesResponse>({ files: [] });
  return apiFetch<FilesResponse>(`/api/files?folderId=${encodeURIComponent(folderId)}`);
}

export function startUpload(input: {
  name: string;
  folderId: string;
  mimeType: string;
  sizeBytes: number;
  metadata?: ResourceFileMetadata;
}) {
  return apiFetch<UploadTicket>("/api/files", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateFile(
  fileId: string,
  input: {
    name?: string;
    metadata?: ResourceFileMetadata;
    uploadStatus?: "READY" | "FAILED";
  },
) {
  return apiFetch<FileResponse>(`/api/files/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteFile(fileId: string) {
  return apiFetch<{ ok: true }>(`/api/files/${fileId}`, {
    method: "DELETE",
  });
}

export function uploadToSignedUrl(
  file: File,
  uploadUrl: string,
  headers: Record<string, string>,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}
