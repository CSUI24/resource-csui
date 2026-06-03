import type { SessionResponse } from "@/types/api";

import { apiFetch } from "./client";

export function getSession() {
  return apiFetch<SessionResponse>("/api/auth/session");
}
