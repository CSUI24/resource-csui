"use client";

import { useQuery } from "@tanstack/react-query";

import { searchResources } from "@/lib/api/search";
import { QUERY_STALE } from "@/lib/constants";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchResources(query),
    staleTime: QUERY_STALE.search,
    enabled: query.trim().length > 0,
  });
}
