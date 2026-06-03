import { getCurrentUser } from "@/lib/auth/session";
import { json } from "@/lib/http";
import type { SessionResponse } from "@/types/api";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  return json<SessionResponse>({ user });
}
