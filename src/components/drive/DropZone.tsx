"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DropZone({
  isDragging,
  children,
  dragHandlers,
  onContextMenu,
}: {
  isDragging: boolean;
  children: ReactNode;
  dragHandlers: {
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
  onContextMenu: (event: React.MouseEvent) => void;
}) {
  return (
    <div
      className="relative min-h-[calc(100dvh-56px)] p-4 lg:p-6"
      onContextMenu={onContextMenu}
      onDragOver={dragHandlers.onDragOver}
      onDragLeave={dragHandlers.onDragLeave}
      onDrop={dragHandlers.onDrop}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none fixed inset-4 z-40 hidden items-center justify-center rounded-lg border border-dashed border-ring bg-background/80 text-sm font-medium",
          isDragging && "flex",
        )}
      >
        Upload
      </div>
    </div>
  );
}
