import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { error, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createPreviewUrl } from "@/lib/r2";

export const runtime = "nodejs";

interface PreviewUrlContext {
  params: Promise<{ fileId: string }>;
}

interface PreviewUrlResponse {
  url: string;
  expiresInSeconds: number;
}

export async function GET(_request: NextRequest, context: PreviewUrlContext) {
  try {
    await requireUser();
    const { fileId } = await context.params;
    const file = await prisma.resourceFile.findFirst({
      where: { id: fileId, uploadStatus: "READY" },
    });
    if (!file) return error("File not found", 404);
    return json<PreviewUrlResponse>({
      url: await createPreviewUrl(file.storageKey, file.name),
      expiresInSeconds: 60 * 5,
    });
  } catch {
    return error("Preview could not be prepared", 400);
  }
}
