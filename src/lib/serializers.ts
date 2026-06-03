import type { Prisma } from "@/generated/prisma/client";
import type { ResourceFile, ResourceFileMetadata } from "@/types/file";
import type { Folder } from "@/types/folder";
import { isRecord } from "./utils";

type FolderWithCounts = {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    children?: number;
    files?: number;
  };
};

type FileModel = {
  id: string;
  name: string;
  folderId: string;
  ownerId: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  metadata: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeFolder(folder: FolderWithCounts): Folder {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    ownerId: folder.ownerId,
    isDefault: folder.isDefault,
    itemCount: (folder._count?.children ?? 0) + (folder._count?.files ?? 0),
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  };
}

export function serializeMetadata(value: Prisma.JsonValue): ResourceFileMetadata {
  if (!isRecord(value)) return {};
  return {
    description: typeof value.description === "string" ? value.description : undefined,
    week: typeof value.week === "number" ? value.week : undefined,
    tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === "string") : undefined,
    lecturer: typeof value.lecturer === "string" ? value.lecturer : undefined,
  };
}

export function serializeFile(file: FileModel): ResourceFile {
  return {
    id: file.id,
    name: file.name,
    folderId: file.folderId,
    ownerId: file.ownerId,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    storageUrl: file.storageUrl,
    metadata: serializeMetadata(file.metadata),
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}
