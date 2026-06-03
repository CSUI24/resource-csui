import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getBreadcrumbs, getFolder } from "@/lib/data/folders";
import { error, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeFolder } from "@/lib/serializers";
import { renameSchema } from "@/lib/validation";
import type { BreadcrumbsResponse, FolderResponse } from "@/types/api";

export const runtime = "nodejs";

interface FolderContext {
  params: Promise<{ folderId: string }>;
}

export async function GET(_request: NextRequest, context: FolderContext) {
  try {
    await requireUser();
    const { folderId } = await context.params;
    const folder = await getFolder(folderId);
    if (!folder) return error("Folder not found", 404);
    const breadcrumbs = await getBreadcrumbs(folderId);
    return json<FolderResponse & BreadcrumbsResponse>({ folder: serializeFolder(folder), breadcrumbs });
  } catch {
    return error("Sign in to continue", 401);
  }
}

export async function PATCH(request: NextRequest, context: FolderContext) {
  try {
    await requireUser();
    const { folderId } = await context.params;
    const parsed = renameSchema.safeParse(await request.json());
    if (!parsed.success) return error("Check the folder name and try again");

    const folder = await getFolder(folderId);
    if (!folder) return error("Folder not found", 404);
    if (folder.isDefault) return error("Default folders cannot be renamed", 403);

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: { name: parsed.data.name },
      include: { _count: { select: { children: true, files: { where: { uploadStatus: "READY" } } } } },
    });

    return json<FolderResponse>({ folder: serializeFolder(updated) });
  } catch {
    return error("Folder could not be renamed", 400);
  }
}

export async function DELETE(_request: NextRequest, context: FolderContext) {
  try {
    await requireUser();
    const { folderId } = await context.params;
    const folder = await getFolder(folderId);
    if (!folder) return error("Folder not found", 404);
    if (folder.isDefault) return error("Default folders cannot be deleted", 403);

    await prisma.folder.delete({ where: { id: folderId } });
    return json({ ok: true });
  } catch {
    return error("Folder could not be deleted", 400);
  }
}
