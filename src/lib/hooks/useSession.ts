"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/lib/api/auth";
import { QUERY_STALE } from "@/lib/constants";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: QUERY_STALE.session,
  });
}
