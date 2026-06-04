"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getFiles, updateFile } from "@/lib/api/files";
import { QUERY_STALE } from "@/lib/constants";
import type { ResourceFileMetadata } from "@/types/file";

export function useFiles(folderId: string | null) {
  return useQuery({
    queryKey: ["files", folderId],
    queryFn: () => getFiles(folderId),
    staleTime: QUERY_STALE.workspace,
  });
}

export function useUpdateFile(folderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, input }: { fileId: string; input: { name?: string; metadata?: ResourceFileMetadata } }) =>
      updateFile(fileId, input),
    onSuccess: () => toast.success("File updated"),
    onError: (cause) => toast.error(cause instanceof Error ? cause.message : "File could not be updated"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["files", folderId] });
    },
  });
}
