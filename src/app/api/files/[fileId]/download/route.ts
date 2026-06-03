import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { error } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/r2";

export const runtime = "nodejs";

interface DownloadContext {
  params: Promise<{ fileId: string }>;
}

export async function GET(_request: NextRequest, context: DownloadContext) {
  try {
    const user = await requireUser();
    const { fileId } = await context.params;
    const file = await prisma.resourceFile.findFirst({
      where: { id: fileId, ownerId: user.id, uploadStatus: "READY" },
    });
    if (!file) return error("File not found", 404);

    return NextResponse.redirect(await createDownloadUrl(file.storageKey, file.name));
  } catch {
    return error("Download could not be prepared", 400);
  }
}
