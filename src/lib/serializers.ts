import type { Prisma } from "@/generated/prisma/client";
import type { ResourceFile, ResourceFileMetadata } from "@/types/file";
import type { Folder } from "@/types/folder";
import { isRecord } from "./utils";

type FolderWithCounts = {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  owner?: OwnerIdentity | null;
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
  owner?: OwnerIdentity | null;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  metadata: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

type OwnerIdentity = {
  name?: string | null;
  username?: string | null;
  email?: string | null;
};

export function serializeFolder(folder: FolderWithCounts): Folder {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    ownerId: folder.ownerId,
    ownerLabel: serializeOwnerLabel(folder.owner, "initials"),
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
    contributorVisibility:
      value.contributorVisibility === "full" || value.contributorVisibility === "initials"
        ? value.contributorVisibility
        : undefined,
  };
}

export function serializeFile(file: FileModel): ResourceFile {
  const metadata = serializeMetadata(file.metadata);
  return {
    id: file.id,
    name: file.name,
    folderId: file.folderId,
    ownerId: file.ownerId,
    ownerLabel: serializeOwnerLabel(file.owner, metadata.contributorVisibility ?? "initials"),
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    storageUrl: file.storageUrl,
    metadata,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}

function serializeOwnerLabel(owner?: OwnerIdentity | null, visibility: "initials" | "full" = "initials") {
  const source = owner?.name || owner?.username || owner?.email?.split("@")[0] || "";
  if (!source.trim()) return "U***";
  if (visibility === "full") return source.trim();

  const parts = source
    .replace(/[^a-zA-Z0-9\s._-]/g, " ")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U***";
  return parts.map(maskPart).join(" ");
}

function maskPart(value: string) {
  const initial = value[0]?.toUpperCase() ?? "U";
  return `${initial}***`;
}
