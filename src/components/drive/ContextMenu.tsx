"use client";

import { Copy, Download, Edit3, FolderPlus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResourceFile } from "@/types/file";
import type { Folder } from "@/types/folder";

export type DriveMenuTarget =
  | { kind: "canvas"; x: number; y: number }
  | { kind: "folder"; x: number; y: number; folder: Folder }
  | { kind: "file"; x: number; y: number; file: ResourceFile };

export function ContextMenu({
  target,
  onOpenChange,
  onNewFolder,
  onUpload,
  newFolderLabel = "New Folder",
  canUpload = true,
  canCreateFromFolder = true,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
}: {
  target: DriveMenuTarget | null;
  onOpenChange: (open: boolean) => void;
  onNewFolder: () => void;
  onUpload: () => void;
  newFolderLabel?: string;
  canUpload?: boolean;
  canCreateFromFolder?: boolean;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameFile: (file: ResourceFile) => void;
  onDeleteFile: (file: ResourceFile) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (target) triggerRef.current?.click();
  }, [target]);

  return (
    <DropdownMenu open={Boolean(target)} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Context menu"
          className="fixed h-px w-px opacity-0"
          style={{ left: target?.x ?? 0, top: target?.y ?? 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {target?.kind === "canvas" && (
          <>
            <DropdownMenuItem onSelect={onNewFolder}>
              <FolderPlus className="h-4 w-4" />
              {newFolderLabel}
            </DropdownMenuItem>
            {canUpload && (
              <DropdownMenuItem onSelect={onUpload}>
                <Upload className="h-4 w-4" />
                Upload
              </DropdownMenuItem>
            )}
          </>
        )}
        {target?.kind === "folder" && (
          <>
            {!target.folder.isDefault && (
              <>
                <DropdownMenuItem onSelect={() => onRenameFolder(target.folder)}>
                  <Edit3 className="h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDeleteFolder(target.folder)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {canCreateFromFolder && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onNewFolder}>
                  <FolderPlus className="h-4 w-4" />
                  {newFolderLabel}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
        {target?.kind === "file" && (
          <>
            <DropdownMenuItem onSelect={() => onRenameFile(target.file)}>
              <Edit3 className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                window.location.href = `/api/files/${target.file.id}/download`;
              }}
            >
              <Download className="h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void navigator.clipboard.writeText(`${window.location.origin}/api/files/${target.file.id}/download`);
              }}
            >
              <Copy className="h-4 w-4" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDeleteFile(target.file)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
