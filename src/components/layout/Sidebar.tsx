"use client";

import { FolderClosed, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarSkeleton } from "@/components/shared/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { useFolders } from "@/lib/hooks/useFolders";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const courses = useFolders(null);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/drive" className="text-sm font-medium">
          Resource CSUI
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {courses.isLoading ? (
          <SidebarSkeleton />
        ) : (
          <nav className="space-y-1">
            {(courses.data?.folders ?? []).map((folder) => {
              const active = pathname === `/drive/${folder.id}`;
              return (
                <Link
                  key={folder.id}
                  href={`/drive/${folder.id}`}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground",
                    active && "bg-muted text-foreground",
                  )}
                >
                  <FolderClosed className="h-4 w-4" />
                  <span className="truncate">{folder.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
      <div className="border-t border-border p-3">
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => window.dispatchEvent(new CustomEvent("resource:new-folder"))}
        >
          <Plus className="h-4 w-4" />
          New Folder
        </Button>
      </div>
    </aside>
  );
}
