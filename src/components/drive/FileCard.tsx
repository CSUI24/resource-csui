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
        "flex min-w-0 items-center gap-3 rounded-md border border-border bg-background text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-ring",
        view === "grid" ? "h-28 flex-col items-start justify-between p-4" : "h-14 px-3",
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
      <Icon className={cn(iconClass, "text-file")} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{file.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {getFileTypeLabel(file.name)} · {formatBytes(file.sizeBytes)} · {formatDate(file.updatedAt)}
        </div>
      </div>
    </button>
  );
}
