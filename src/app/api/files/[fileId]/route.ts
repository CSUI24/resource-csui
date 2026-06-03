import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { error, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { deleteObject, verifyObject } from "@/lib/r2";
import { serializeFile } from "@/lib/serializers";
import { updateFileSchema } from "@/lib/validation";
import type { FileResponse } from "@/types/api";

export const runtime = "nodejs";

interface FileContext {
  params: Promise<{ fileId: string }>;
}

export async function GET(_request: NextRequest, context: FileContext) {
  try {
    await requireUser();
    const { fileId } = await context.params;
    const file = await prisma.resourceFile.findFirst({
      where: { id: fileId },
      include: { owner: { select: { name: true, username: true, email: true } } },
    });
    if (!file) return error("File not found", 404);
    return json<FileResponse>({ file: serializeFile(file) });
  } catch {
    return error("Sign in to continue", 401);
  }
}

export async function PATCH(request: NextRequest, context: FileContext) {
  try {
    await requireUser();
    const { fileId } = await context.params;
    const parsed = updateFileSchema.safeParse(await request.json());
    if (!parsed.success) return error("Check the file details and try again");

    const file = await prisma.resourceFile.findFirst({
      where: { id: fileId },
      include: { owner: { select: { name: true, username: true, email: true } } },
    });
    if (!file) return error("File not found", 404);

    if (parsed.data.uploadStatus === "READY") {
      const exists = await verifyObject(file.storageKey, file.sizeBytes);
      if (!exists) return error("Upload did not finish. Try again", 409);
    }

    const updated = await prisma.resourceFile.update({
      where: { id: fileId },
      data: {
        name: parsed.data.name,
        metadata: parsed.data.metadata,
        uploadStatus: parsed.data.uploadStatus,
      },
      include: { owner: { select: { name: true, username: true, email: true } } },
    });

    return json<FileResponse>({ file: serializeFile(updated) });
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "File could not be updated", 400);
  }
}

export async function DELETE(_request: NextRequest, context: FileContext) {
  try {
    await requireUser();
    const { fileId } = await context.params;
    const file = await prisma.resourceFile.findFirst({ where: { id: fileId } });
    if (!file) return error("File not found", 404);

    await prisma.resourceFile.delete({ where: { id: fileId } });
    await deleteObject(file.storageKey).catch(() => undefined);
    return json({ ok: true });
  } catch {
    return error("File could not be deleted", 400);
  }
}
