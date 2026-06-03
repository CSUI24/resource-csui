"use client";

import { Grid2X2, List, Plus } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { BreadcrumbNav } from "@/components/layout/BreadcrumbNav";
import { DriveSkeleton } from "@/components/shared/LoadingSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCreateFolder, useDeleteFolder, useFolders, useRenameFolder } from "@/lib/hooks/useFolders";
import { useDeleteFile, useFiles, useUpdateFile } from "@/lib/hooks/useFiles";
import { useDragDrop } from "@/lib/hooks/useDragDrop";
import type { ResourceFile } from "@/types/file";
import type { Folder } from "@/types/folder";

import { ContextMenu, type DriveMenuTarget } from "./ContextMenu";
import { DriveGrid } from "./DriveGrid";
import { DropZone } from "./DropZone";
import { FileInfoSheet } from "./FileInfoSheet";
import { NewFolderDialog } from "./NewFolderDialog";
import { RenameDialog } from "./RenameDialog";
import { UploadDialog } from "./UploadDialog";

type SortMode = "name" | "date";

export function DriveWorkspace({ folderId }: { folderId: string | null }) {
  const view = useStoredView();
  const [sort, setSort] = useState<SortMode>("name");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadNonce, setUploadNonce] = useState(0);
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ kind: "folder"; folder: Folder } | { kind: "file"; file: ResourceFile } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "folder"; folder: Folder } | { kind: "file"; file: ResourceFile } | null>(null);
  const [menuTarget, setMenuTarget] = useState<DriveMenuTarget | null>(null);

  const folders = useFolders(folderId);
  const files = useFiles(folderId);
  const createFolder = useCreateFolder(folderId);
  const renameFolder = useRenameFolder(folderId);
  const deleteFolder = useDeleteFolder(folderId);
  const updateFile = useUpdateFile(folderId);
  const deleteFile = useDeleteFile(folderId);

  const drag = useDragDrop((filesToUpload) => {
    if (!folderId) return;
    setUploadFiles(filesToUpload);
    setUploadNonce((value) => value + 1);
    setUploadOpen(true);
  });

  useEffect(() => {
    const openNewFolder = () => setNewFolderOpen(true);
    const openUpload = () => {
      setUploadFiles([]);
      setUploadNonce((value) => value + 1);
      setUploadOpen(true);
    };
    window.addEventListener("resource:new-folder", openNewFolder);
    window.addEventListener("resource:upload", openUpload);
    return () => {
      window.removeEventListener("resource:new-folder", openNewFolder);
      window.removeEventListener("resource:upload", openUpload);
    };
  }, []);

  const sortedFolders = useMemo(() => sortFolders(folders.data?.folders ?? [], sort), [folders.data?.folders, sort]);
  const sortedFiles = useMemo(() => sortFiles(files.data?.files ?? [], sort), [files.data?.files, sort]);
  const isLoading = folders.isLoading || files.isLoading;

  return (
    <DropZone
      isDragging={drag.isDragging}
      dragHandlers={drag}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuTarget({ kind: "canvas", x: event.clientX, y: event.clientY });
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BreadcrumbNav folderId={folderId} />
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(value) => setSort(value as SortMode)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setStoredView(value as "grid" | "list")}>
              <ToggleGroupItem value="grid" aria-label="Grid">
                <Grid2X2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        {isLoading ? (
          <DriveSkeleton />
        ) : sortedFolders.length === 0 && sortedFiles.length === 0 ? (
          <EmptyState
            label={folderId ? "No files or folders" : "No courses"}
            action={
              <Button onClick={() => setNewFolderOpen(true)}>
                <Plus className="h-4 w-4" />
                New Folder
              </Button>
            }
          />
        ) : (
          <DriveGrid
            folders={sortedFolders}
            files={sortedFiles}
            view={view}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onFolderContext={(event, folder) => {
              event.preventDefault();
              setMenuTarget({ kind: "folder", folder, x: event.clientX, y: event.clientY });
            }}
            onFileContext={(event, file) => {
              event.preventDefault();
              setMenuTarget({ kind: "file", file, x: event.clientX, y: event.clientY });
            }}
          />
        )}
      </div>

      <ContextMenu
        target={menuTarget}
        onOpenChange={(open) => !open && setMenuTarget(null)}
        onNewFolder={() => setNewFolderOpen(true)}
        onUpload={() => {
          setUploadFiles([]);
          setUploadNonce((value) => value + 1);
          setUploadOpen(true);
        }}
        onRenameFolder={(folder) => setRenameTarget({ kind: "folder", folder })}
        onDeleteFolder={(folder) => setDeleteTarget({ kind: "folder", folder })}
        onRenameFile={(file) => setRenameTarget({ kind: "file", file })}
        onDeleteFile={(file) => setDeleteTarget({ kind: "file", file })}
      />

      <NewFolderDialog
        open={newFolderOpen}
        pending={createFolder.isPending}
        onOpenChange={setNewFolderOpen}
        onCreate={(name) => {
          createFolder.mutate(name, { onSuccess: () => setNewFolderOpen(false) });
        }}
      />
      <UploadDialog
        key={uploadNonce}
        open={uploadOpen}
        folderId={folderId}
        initialFiles={uploadFiles}
        onOpenChange={setUploadOpen}
      />
      <FileInfoSheet file={selectedFile} folderId={folderId} open={Boolean(selectedFile)} onOpenChange={(open) => !open && setSelectedFile(null)} />
      <RenameDialog
        key={renameTarget?.kind === "folder" ? renameTarget.folder.id : renameTarget?.file.id ?? "rename"}
        open={Boolean(renameTarget)}
        initialName={renameTarget?.kind === "folder" ? renameTarget.folder.name : renameTarget?.file.name ?? ""}
        pending={renameFolder.isPending || updateFile.isPending}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onRename={(name) => {
          if (renameTarget?.kind === "folder") {
            renameFolder.mutate(
              { folderId: renameTarget.folder.id, name },
              { onSuccess: () => setRenameTarget(null) },
            );
          }
          if (renameTarget?.kind === "file") {
            updateFile.mutate(
              { fileId: renameTarget.file.id, input: { name } },
              { onSuccess: () => setRenameTarget(null) },
            );
          }
        }}
      />
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.kind === "folder") deleteFolder.mutate(deleteTarget.folder.id);
                if (deleteTarget?.kind === "file") deleteFile.mutate(deleteTarget.file.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropZone>
  );
}

function sortFolders(folders: Folder[], sort: SortMode) {
  return [...folders].sort((a, b) => {
    if (sort === "date") return b.updatedAt.localeCompare(a.updatedAt);
    return a.name.localeCompare(b.name);
  });
}

function sortFiles(files: ResourceFile[], sort: SortMode) {
  return [...files].sort((a, b) => {
    if (sort === "date") return b.updatedAt.localeCompare(a.updatedAt);
    return a.name.localeCompare(b.name);
  });
}

function useStoredView(): "grid" | "list" {
  return useSyncExternalStore<"grid" | "list">(subscribeToView, getStoredView, () => "grid");
}

function subscribeToView(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("resource:view", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("resource:view", listener);
  };
}

function getStoredView(): "grid" | "list" {
  const stored = window.localStorage.getItem("resource-view");
  return stored === "grid" || stored === "list" ? stored : "grid";
}

function setStoredView(view: "grid" | "list") {
  window.localStorage.setItem("resource-view", view);
  window.dispatchEvent(new Event("resource:view"));
}
