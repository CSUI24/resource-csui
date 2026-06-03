import type { SearchResponse } from "@/types/api";

import { apiFetch } from "./client";

export function searchResources(query: string) {
  if (!query.trim()) return Promise.resolve<SearchResponse>({ folders: [], files: [] });
  return apiFetch<SearchResponse>(`/api/search?q=${encodeURIComponent(query.trim())}`);
}
