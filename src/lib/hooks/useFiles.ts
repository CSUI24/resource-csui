"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteFile, getFiles, updateFile } from "@/lib/api/files";
import { QUERY_STALE } from "@/lib/constants";
import type { FilesResponse } from "@/types/api";
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

export function useDeleteFile(folderId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey: ["files", folderId] });
      const previous = queryClient.getQueryData<FilesResponse>(["files", folderId]);
      queryClient.setQueryData<FilesResponse>(["files", folderId], {
        files: (previous?.files ?? []).filter((file) => file.id !== fileId),
      });
      return { previous };
    },
    onError: (cause, _fileId, context) => {
      queryClient.setQueryData(["files", folderId], context?.previous);
      toast.error(cause instanceof Error ? cause.message : "File could not be deleted");
    },
    onSuccess: () => toast.success("File deleted"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["files", folderId] });
    },
  });
}
