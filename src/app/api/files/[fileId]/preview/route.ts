import { NextResponse, type NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { error } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createPreviewUrl } from "@/lib/r2";

export const runtime = "nodejs";

interface PreviewContext {
  params: Promise<{ fileId: string }>;
}

export async function GET(_request: NextRequest, context: PreviewContext) {
  try {
    await requireUser();
    const { fileId } = await context.params;
    const file = await prisma.resourceFile.findFirst({
      where: { id: fileId, uploadStatus: "READY" },
    });
    if (!file) return error("File not found", 404);
    const response = NextResponse.redirect(
      await createPreviewUrl(file.storageKey, file.name),
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return error("Preview could not be prepared", 400);
  }
}
