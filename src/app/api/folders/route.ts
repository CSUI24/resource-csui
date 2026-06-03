import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { createFolderWithDefaults, listFolders } from "@/lib/data/folders";
import { error, json } from "@/lib/http";
import { createFolderSchema } from "@/lib/validation";
import type { FolderResponse, FoldersResponse } from "@/types/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const parentId = request.nextUrl.searchParams.get("parentId");
    const folders = await listFolders(user.id, parentId);
    return json<FoldersResponse>({ folders });
  } catch {
    return error("Sign in to continue", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createFolderSchema.safeParse(await request.json());
    if (!parsed.success) return error("Check the folder name and try again");

    const folder = await createFolderWithDefaults(user.id, parsed.data.name, parsed.data.parentId ?? null);
    return json<FolderResponse>({ folder }, { status: 201 });
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Folder could not be created", 400);
  }
}
