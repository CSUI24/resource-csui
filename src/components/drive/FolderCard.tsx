"use client";

import { FolderClosed } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Folder } from "@/types/folder";

export function FolderCard({
  folder,
  selected,
  view,
  onSelect,
  onContextMenu,
}: {
  folder: Folder;
  selected: boolean;
  view: "grid" | "list";
  onSelect: (folder: Folder) => void;
  onContextMenu: (event: React.MouseEvent, folder: Folder) => void;
}) {
  const router = useRouter();
  const isGrid = view === "grid";
  const typeLabel = folder.parentId === null ? "Course" : "Folder";

  return (
    <button
      type="button"
      className={cn(
        "group flex w-full min-w-0 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isGrid
          ? "h-40 flex-col items-center justify-center gap-3 rounded-[10px] text-center"
          : "h-16 items-center rounded-[6px] border border-transparent bg-background px-3",
        !isGrid && selected && "bg-surface-soft",
        isGrid && selected && "bg-surface-soft",
      )}
      onClick={() => onSelect(folder)}
      onDoubleClick={() => router.push(`/drive/${folder.id}`)}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu(event, folder);
      }}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          isGrid ? "w-full max-w-full flex-col gap-3 px-2" : "flex-1",
        )}
      >
        {isGrid ? (
          <span className="relative block h-20 w-28 shrink-0">
            <span className="absolute left-1 top-2 h-4 w-11 rounded-t-[6px] bg-[#f1c982]" />
            <span
              className={cn("absolute inset-x-0 bottom-0 h-16 rounded-[10px] bg-[#f5d29a]", selected && "bg-[#f1c982]")}
            />
          </span>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft">
            <FolderClosed className="h-5 w-5 text-folder" />
          </span>
        )}
        <div
          className={cn(
            "min-w-0",
            isGrid ? "w-full max-w-full px-1" : "flex-1",
          )}
        >
          <div className="block w-full truncate text-sm font-medium">
            {folder.name}
          </div>
          {!isGrid && (
            <div className="truncate text-xs text-muted-foreground">
              {folder.itemCount} items
            </div>
          )}
        </div>
      </div>
      {isGrid && (
        <div className="w-full max-w-full truncate px-3 text-xs text-muted-foreground">
          {folder.itemCount} items
        </div>
      )}
      {!isGrid && (
        <div className="ml-4 hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
          <div>{typeLabel}</div>
          <div>{formatRelativeDate(folder.updatedAt)}</div>
        </div>
      )}
    </button>
  );
}

function formatRelativeDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
