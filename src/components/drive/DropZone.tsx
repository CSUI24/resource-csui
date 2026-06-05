"use client";

import type { ReactNode } from "react";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

export function DropZone({
  isDragging,
  children,
  dragHandlers,
  onContextMenu,
  disabled = false,
}: {
  isDragging: boolean;
  children: ReactNode;
  dragHandlers: {
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
  onContextMenu: (event: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-surface-soft px-4 py-6 lg:px-8 lg:py-8"
      onContextMenu={onContextMenu}
      onDragOver={disabled ? undefined : dragHandlers.onDragOver}
      onDragLeave={disabled ? undefined : dragHandlers.onDragLeave}
      onDrop={disabled ? undefined : dragHandlers.onDrop}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none fixed inset-4 z-40 hidden items-center justify-center rounded-[12px] border border-dashed border-ring bg-background/90 text-sm font-medium text-foreground backdrop-blur-sm",
          isDragging && "flex",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-[12px] bg-surface-soft">
            <Upload className="h-7 w-7 text-foreground" />
          </span>
          <div className="text-base font-medium text-foreground">Drop files to upload</div>
          <div className="mt-1 text-xs text-muted-foreground">PDF, Office files, images, and ZIP up to 50 MB</div>
        </div>
      </div>
    </div>
  );
}
