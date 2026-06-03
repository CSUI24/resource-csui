import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

import { requireUser } from "@/lib/auth/session";
import { listFiles } from "@/lib/data/files";
import { getFolderForOwner } from "@/lib/data/folders";
import { error, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createStorageKey, createUploadUrl, getStorageUrl } from "@/lib/r2";
import { serializeFile } from "@/lib/serializers";
import { createFileSchema, validateUploadName } from "@/lib/validation";
import type { FilesResponse } from "@/types/api";
import type { UploadTicket } from "@/types/file";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const folderId = request.nextUrl.searchParams.get("folderId");
    if (!folderId) return json<FilesResponse>({ files: [] });
    const files = await listFiles(user.id, folderId);
    return json<FilesResponse>({ files });
  } catch {
    return error("Sign in to continue", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createFileSchema.safeParse(await request.json());
    if (!parsed.success) return error("Check the file details and try again");
    if (!validateUploadName(parsed.data.name)) return error("File type is not supported", 415);

    const folder = await getFolderForOwner(user.id, parsed.data.folderId);
    if (!folder) return error("Folder not found", 404);

    const file = await prisma.resourceFile.create({
      data: {
        name: parsed.data.name,
        folderId: parsed.data.folderId,
        ownerId: user.id,
        mimeType: parsed.data.mimeType,
        sizeBytes: parsed.data.sizeBytes,
        storageKey: `pending/${user.id}/${randomUUID()}`,
        storageUrl: "pending",
        metadata: normalizeMetadata(parsed.data.metadata),
      },
    });

    const storageKey = createStorageKey(user.id, parsed.data.folderId, file.id, parsed.data.name);
    const updated = await prisma.resourceFile.update({
      where: { id: file.id },
      data: {
        storageKey,
        storageUrl: `/api/files/${file.id}/download`,
      },
    });
    const uploadUrl = await createUploadUrl(storageKey, parsed.data.mimeType);

    return json<UploadTicket>(
      {
        file: serializeFile({ ...updated, storageUrl: getStorageUrl(storageKey) }),
        uploadUrl,
        headers: { "Content-Type": parsed.data.mimeType },
      },
      { status: 201 },
    );
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Upload could not start", 400);
  }
}

function normalizeMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  return metadata;
}
