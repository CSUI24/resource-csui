export interface ResourceFileMetadata {
  description?: string;
  week?: number;
  tags?: string[];
  lecturer?: string;
}

export interface ResourceFile {
  id: string;
  name: string;
  folderId: string;
  ownerId: string;
  ownerLabel: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  metadata: ResourceFileMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTicket {
  file: ResourceFile;
  uploadUrl: string;
  headers: Record<string, string>;
}
