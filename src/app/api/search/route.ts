import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { error, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeFile, serializeFolder } from "@/lib/serializers";
import type { SearchResponse } from "@/types/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q) return json<SearchResponse>({ folders: [], files: [] });

    const [folders, files] = await Promise.all([
      prisma.folder.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        include: { _count: { select: { children: true, files: { where: { uploadStatus: "READY" } } } } },
        take: 20,
      }),
      prisma.resourceFile.findMany({
        where: {
          uploadStatus: "READY",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { metadata: { path: ["description"], string_contains: q } },
            { metadata: { path: ["lecturer"], string_contains: q } },
            { metadata: { path: ["tags"], array_contains: [q] } },
          ],
        },
        take: 30,
      }),
    ]);

    return json<SearchResponse>({
      folders: folders.map(serializeFolder),
      files: files.map(serializeFile),
    });
  } catch {
    return error("Search failed", 400);
  }
}
