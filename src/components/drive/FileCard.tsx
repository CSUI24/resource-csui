"use client";

import { FileArchive, FileImage, FileSpreadsheet, FileText, Presentation } from "lucide-react";

import { cn, formatBytes, formatDate, getExtension, getFileTypeLabel } from "@/lib/utils";
import type { ResourceFile } from "@/types/file";

const iconClass = "h-6 w-6 shrink-0";

export function FileCard({
  file,
  selected,
  view,
  onSelect,
  onContextMenu,
}: {
  file: ResourceFile;
  selected: boolean;
  view: "grid" | "list";
  onSelect: (file: ResourceFile) => void;
  onContextMenu: (event: React.MouseEvent, file: ResourceFile) => void;
}) {
  const extension = getExtension(file.name);
  const isGrid = view === "grid";
  const Icon = extension.includes("ppt")
    ? Presentation
    : extension.includes("xls")
      ? FileSpreadsheet
      : extension.includes("png") || extension.includes("jpg") || extension.includes("jpeg")
        ? FileImage
        : extension.includes("zip")
          ? FileArchive
          : FileText;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full min-w-0 overflow-hidden border border-border bg-background text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isGrid
          ? "h-36 flex-col items-stretch justify-between rounded-[10px] p-4"
          : "h-16 items-center rounded-[6px] border-transparent px-3",
        selected && (isGrid ? "border-ring" : "bg-surface-soft"),
      )}
      onClick={() => onSelect(file)}
      onDoubleClick={() => {
        window.location.href = `/api/files/${file.id}/download`;
      }}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu(event, file);
      }}
    >
      <div className={cn("flex min-w-0 items-center gap-3", isGrid ? "w-full" : "flex-1")}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft">
          <Icon className={cn(iconClass, "text-file")} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{file.name}</div>
          {!isGrid && (
            <div className="truncate text-xs text-muted-foreground">
              {getFileTypeLabel(file.name)} · {formatBytes(file.sizeBytes)} · {formatDate(file.updatedAt)}
            </div>
          )}
        </div>
      </div>
      {isGrid && (
        <div className="truncate border-t border-border pt-3 text-xs text-muted-foreground">
          {getFileTypeLabel(file.name)} · {formatBytes(file.sizeBytes)} · {formatDate(file.updatedAt)}
        </div>
      )}
      {!isGrid && (
        <div className="ml-4 hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
          <div>{formatBytes(file.sizeBytes)}</div>
          <div>{formatDate(file.updatedAt)}</div>
        </div>
      )}
    </button>
  );
}
