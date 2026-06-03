"use client";

import { FolderClosed } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Folder } from "@/types/folder";

export function FolderCard({
  folder,
  view,
  onContextMenu,
}: {
  folder: Folder;
  view: "grid" | "list";
  onContextMenu: (event: React.MouseEvent, folder: Folder) => void;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-md border border-border bg-background text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        view === "grid" ? "h-28 flex-col items-start justify-between p-4" : "h-14 px-3",
      )}
      onDoubleClick={() => router.push(`/drive/${folder.id}`)}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu(event, folder);
      }}
    >
      <FolderClosed className="h-6 w-6 shrink-0 text-folder" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{folder.name}</div>
        <div className="text-xs text-muted-foreground">{folder.itemCount} items</div>
      </div>
    </button>
  );
}
