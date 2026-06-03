"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createFolder, deleteFolder, getFolder, getFolders, renameFolder } from "@/lib/api/folders";
import { QUERY_STALE } from "@/lib/constants";
import type { FoldersResponse } from "@/types/api";
import type { Folder } from "@/types/folder";

export function useFolders(parentId: string | null) {
  return useQuery({
    queryKey: ["folders", parentId],
    queryFn: () => getFolders(parentId),
    staleTime: QUERY_STALE.workspace,
  });
}

export function useFolder(folderId: string | null) {
  return useQuery({
    queryKey: ["folder", folderId],
    queryFn: () => getFolder(folderId ?? ""),
    enabled: Boolean(folderId),
    staleTime: QUERY_STALE.workspace,
  });
}

export function useCreateFolder(parentId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createFolder({ name, parentId }),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["folders", parentId] });
      const previous = queryClient.getQueryData<FoldersResponse>(["folders", parentId]);
      const optimistic: Folder = {
        id: `optimistic-${Date.now()}`,
        name,
        parentId,
        ownerId: "optimistic",
        ownerLabel: "Y***",
        isDefault: false,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<FoldersResponse>(["folders", parentId], {
        folders: [...(previous?.folders ?? []), optimistic],
      });
      return { previous };
    },
    onError: (cause, _name, context) => {
      queryClient.setQueryData(["folders", parentId], context?.previous);
      toast.error(cause instanceof Error ? cause.message : "Folder could not be created");
    },
    onSuccess: () => toast.success("Folder created"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["folders", parentId] });
      void queryClient.invalidateQueries({ queryKey: ["folders", null] });
    },
  });
}

export function useRenameFolder(parentId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) => renameFolder(folderId, name),
    onSuccess: () => toast.success("Folder renamed"),
    onError: (cause) => toast.error(cause instanceof Error ? cause.message : "Folder could not be renamed"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["folders", parentId] });
      void queryClient.invalidateQueries({ queryKey: ["folder"] });
    },
  });
}

export function useDeleteFolder(parentId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => toast.success("Folder deleted"),
    onError: (cause) => toast.error(cause instanceof Error ? cause.message : "Folder could not be deleted"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["folders", parentId] });
      void queryClient.invalidateQueries({ queryKey: ["folders", null] });
    },
  });
}
