"use client";

import { Grid2X2, List, Upload } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useRenameFolder,
} from "@/lib/hooks/useFolders";
import { useFiles, useUpdateFile } from "@/lib/hooks/useFiles";
import { useDragDrop } from "@/lib/hooks/useDragDrop";
import type { ResourceFile } from "@/types/file";
import type { Folder } from "@/types/folder";

import { ContextMenu, type DriveMenuTarget } from "./ContextMenu";
import { DriveGrid } from "./DriveGrid";
import { DriveInspector } from "./DriveInspector";
import { DropZone } from "./DropZone";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { NewFolderDialog } from "./NewFolderDialog";
import { RenameDialog } from "./RenameDialog";
import { UploadDialog } from "./UploadDialog";

type SortMode = "name" | "date";

export function DriveWorkspace({ folderId }: { folderId: string | null }) {
  const isRoot = folderId === null;
  const folderSectionLabel = isRoot ? "Courses" : "Folders";
  const newFolderLabel = isRoot ? "New Course" : "New Folder";
  const folderDialogLabel = isRoot ? "Course" : "Folder";
  const view = useStoredView();
  const [sort, setSort] = useState<SortMode>("name");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadNonce, setUploadNonce] = useState(0);
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [previewFile, setPreviewFile] = useState<ResourceFile | null>(null);
  const [renameTarget, setRenameTarget] = useState<
    | { kind: "folder"; folder: Folder }
    | { kind: "file"; file: ResourceFile }
    | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "folder"; folder: Folder } | null
  >(null);
  const [menuTarget, setMenuTarget] = useState<DriveMenuTarget | null>(null);

  const folders = useFolders(folderId);
  const files = useFiles(folderId);
  const createFolder = useCreateFolder(folderId);
  const renameFolder = useRenameFolder(folderId);
  const deleteFolder = useDeleteFolder(folderId);
  const updateFile = useUpdateFile(folderId);

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

  const sortedFolders = useMemo(
    () => sortFolders(folders.data?.folders ?? [], sort),
    [folders.data?.folders, sort],
  );
  const sortedFiles = useMemo(
    () => sortFiles(files.data?.files ?? [], sort),
    [files.data?.files, sort],
  );
  const isLoading = folders.isLoading || files.isLoading;
  const selectedTarget = selectedFolder
    ? { kind: "folder" as const, folder: selectedFolder }
    : selectedFile
      ? { kind: "file" as const, file: selectedFile }
      : null;

  return (
    <div className="flex h-[calc(100dvh-64px)] min-h-0 min-w-0 overflow-hidden">
      <DropZone
        isDragging={drag.isDragging}
        dragHandlers={drag}
        disabled={isRoot}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuTarget({ kind: "canvas", x: event.clientX, y: event.clientY });
        }}
      >
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-6">
          <div className="shrink-0 border-b border-border pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <BreadcrumbNav folderId={folderId} />
              <div className="flex items-center gap-3">
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as SortMode)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <ToggleGroup
                  className="inline-flex rounded-full border border-border bg-surface-soft p-0.5"
                  type="single"
                  value={view}
                  onValueChange={(value) =>
                    value && setStoredView(value as "grid" | "list")
                  }
                >
                  <ToggleGroupItem value="grid" aria-label="Grid">
                    <Grid2X2 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            {!isRoot && (
              <Button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("resource:upload"))
                }
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <DriveSkeleton />
            ) : sortedFolders.length === 0 && sortedFiles.length === 0 ? (
              <div className="flex min-h-full items-center justify-center">
                <EmptyState
                  label={folderId ? "Drag and drop files here" : "No courses"}
                  action={
                    <Button onClick={() => setNewFolderOpen(true)}>
                      {newFolderLabel}
                    </Button>
                  }
                />
              </div>
            ) : (
              <DriveGrid
                folders={sortedFolders}
                files={sortedFiles}
                view={view}
                selectedFolder={selectedFolder}
                selectedFile={selectedFile}
                folderSectionLabel={folderSectionLabel}
                newFolderLabel={newFolderLabel}
                onSelectFolder={(folder) => {
                  setSelectedFolder(folder);
                  setSelectedFile(null);
                }}
                onSelectFile={(file) => {
                  setSelectedFile(file);
                  setSelectedFolder(null);
                }}
                onOpenFile={(file) => setPreviewFile(file)}
                onNewFolder={() => setNewFolderOpen(true)}
                onFolderContext={(event, folder) => {
                  event.preventDefault();
                  setMenuTarget({
                    kind: "folder",
                    folder,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
                onFileContext={(event, file) => {
                  event.preventDefault();
                  setMenuTarget({
                    kind: "file",
                    file,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
              />
            )}
          </div>
        </div>

        <ContextMenu
          target={menuTarget}
          onOpenChange={(open) => !open && setMenuTarget(null)}
          onNewFolder={() => setNewFolderOpen(true)}
          newFolderLabel={newFolderLabel}
          canUpload={!isRoot}
          canCreateFromFolder={!isRoot}
          onUpload={() => {
            setUploadFiles([]);
            setUploadNonce((value) => value + 1);
            setUploadOpen(true);
          }}
          onRenameFolder={(folder) =>
            setRenameTarget({ kind: "folder", folder })
          }
          onDeleteFolder={(folder) =>
            setDeleteTarget({ kind: "folder", folder })
          }
          onRenameFile={(file) => setRenameTarget({ kind: "file", file })}
          onPreviewFile={(file) => {
            setSelectedFile(file);
            setSelectedFolder(null);
            setPreviewFile(file);
          }}
        />
      </DropZone>
      <DriveInspector target={selectedTarget} />

      <NewFolderDialog
        open={newFolderOpen}
        pending={createFolder.isPending}
        label={folderDialogLabel}
        onOpenChange={setNewFolderOpen}
        onCreate={(name) => {
          createFolder.mutate(name, {
            onSuccess: () => setNewFolderOpen(false),
          });
        }}
      />
      <UploadDialog
        key={uploadNonce}
        open={uploadOpen}
        folderId={folderId}
        initialFiles={uploadFiles}
        onOpenChange={setUploadOpen}
      />
      <FilePreviewDialog
        file={previewFile}
        open={Boolean(previewFile)}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
      <RenameDialog
        key={
          renameTarget?.kind === "folder"
            ? renameTarget.folder.id
            : (renameTarget?.file.id ?? "rename")
        }
        open={Boolean(renameTarget)}
        initialName={
          renameTarget?.kind === "folder"
            ? renameTarget.folder.name
            : (renameTarget?.file.name ?? "")
        }
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
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.kind === "folder")
                  deleteFolder.mutate(deleteTarget.folder.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
  return useSyncExternalStore<"grid" | "list">(
    subscribeToView,
    getStoredView,
    () => "grid",
  );
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
