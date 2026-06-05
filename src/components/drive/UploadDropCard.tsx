"use client";

import { FileText, Info, UploadCloud } from "lucide-react";

import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { cn, formatBytes } from "@/lib/utils";

export function UploadDropCard({
  filesCount = 0,
  isDragging = false,
  disabled = false,
  onBrowse,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  filesCount?: number;
  isDragging?: boolean;
  disabled?: boolean;
  onBrowse: () => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex min-h-64 flex-col items-center justify-center rounded-[12px] border border-dashed border-ring bg-background px-5 py-8 text-center",
          "sm:min-h-72",
          isDragging && "bg-surface-soft ring-2 ring-ring/20",
          disabled && "opacity-70",
        )}
        onDragOver={disabled ? undefined : onDragOver}
        onDragLeave={disabled ? undefined : onDragLeave}
        onDrop={disabled ? undefined : onDrop}
      >
        <div className="relative mb-2 h-24 w-24">
          <FileText className="absolute left-5 top-2 h-16 w-16 stroke-[1.25] text-border" />
          <span className="absolute bottom-3 right-4 flex p-2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <UploadCloud className="h-3 w-3" />
          </span>
        </div>
        <div className="text-md font-medium text-muted-foreground">
          {filesCount > 0
            ? `${filesCount} file${filesCount > 1 ? "s" : ""} ready`
            : "Drop your files here"}
          {", "}
          <button
            type="button"
            className="font-medium text-ring underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={disabled}
            onClick={onBrowse}
          >
            or click to browse
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">
            Supported files: {ACCEPTED_EXTENSIONS.join(", ")}
          </span>
        </div>
        <div className="shrink-0">
          Maximum size: {formatBytes(MAX_FILE_SIZE_BYTES)}
        </div>
      </div>
    </div>
  );
}
