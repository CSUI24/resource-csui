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

  return (
    <button
      type="button"
      className={cn(
        "group flex w-full min-w-0 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isGrid
          ? "h-40 flex-col items-center justify-center gap-3 rounded-[10px] text-center"
          : "h-14 items-center gap-3 rounded-[10px] border border-transparent bg-background px-3",
        !isGrid && selected && "border-ring",
      )}
      onClick={() => onSelect(folder)}
      onDoubleClick={() => router.push(`/drive/${folder.id}`)}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu(event, folder);
      }}
    >
      <div className={cn("flex min-w-0 items-center gap-3", isGrid && "w-full flex-col gap-3")}>
        {isGrid ? (
          <span className="relative block h-20 w-28 shrink-0">
            <span className="absolute left-1 top-2 h-4 w-11 rounded-t-[6px] bg-[#f1c982]" />
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-16 rounded-[10px] bg-[#f5d29a]",
                selected && "outline outline-2 outline-offset-4 outline-ring",
              )}
            />
          </span>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft">
            <FolderClosed className="h-5 w-5 text-folder" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{folder.name}</div>
          {!isGrid && <div className="text-xs text-muted-foreground">{folder.itemCount} items</div>}
        </div>
      </div>
      {isGrid && <div className="truncate text-xs text-muted-foreground">{folder.itemCount} items</div>}
    </button>
  );
}
