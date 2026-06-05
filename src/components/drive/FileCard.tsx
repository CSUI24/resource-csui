"use client";

import { FileThumbnail } from "@/components/drive/FileThumbnail";
import { cn, formatBytes, formatDate, getFileTypeLabel } from "@/lib/utils";
import type { ResourceFile } from "@/types/file";

export function FileCard({
  file,
  selected,
  view,
  onSelect,
  onOpen,
  onContextMenu,
}: {
  file: ResourceFile;
  selected: boolean;
  view: "grid" | "list";
  onSelect: (file: ResourceFile) => void;
  onOpen: (file: ResourceFile) => void;
  onContextMenu: (event: React.MouseEvent, file: ResourceFile) => void;
}) {
  const isGrid = view === "grid";

  return (
    <button
      type="button"
      className={cn(
        "flex w-full min-w-0 overflow-hidden border border-border bg-background text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isGrid
          ? "h-48 flex-col items-stretch justify-between rounded-[10px]"
          : "h-16 items-center rounded-[6px] border-transparent px-3",
        selected && (isGrid ? "border-ring" : "bg-surface-soft"),
      )}
      onClick={() => onSelect(file)}
      onDoubleClick={() => onOpen(file)}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu(event, file);
      }}
    >
      <div className={cn("flex min-w-0 items-center gap-3", isGrid ? "w-full flex-col items-stretch gap-0" : "flex-1")}>
        <FileThumbnail file={file} view={view} />
        <div className="min-w-0 flex-1">
          <div className={cn("truncate text-sm font-medium", isGrid && "px-3 pt-3")}>{file.name}</div>
          {!isGrid && (
            <div className="truncate text-xs text-muted-foreground">
              {getFileTypeLabel(file.name)} · {formatBytes(file.sizeBytes)} · {formatDate(file.updatedAt)}
            </div>
          )}
        </div>
      </div>
      {isGrid && (
        <div className="truncate px-3 pb-3 text-xs text-muted-foreground">
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
