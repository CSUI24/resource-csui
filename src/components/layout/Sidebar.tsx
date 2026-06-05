"use client";

import { ChevronRight, FolderClosed, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SidebarSkeleton } from "@/components/shared/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { useFolders } from "@/lib/hooks/useFolders";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const courses = useFolders(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <aside className="hidden h-dvh min-h-0 w-72 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
        <Link href="/drive" className="min-w-0">
          <span className="block truncate text-base font-medium leading-5 text-foreground">
            Resource Pacil
          </span>
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Courses
        </div>
        {courses.isLoading ? (
          <SidebarSkeleton />
        ) : (
          <nav className="space-y-1.5">
            {(courses.data?.folders ?? []).map((folder) => {
              const active = pathname === `/drive/${folder.id}`;
              const isExpanded = expanded[folder.id] ?? active;
              return (
                <div key={folder.id}>
                  <div
                    className={cn(
                      "flex h-10 min-w-0 items-center gap-1 rounded-[10px] border border-transparent text-sm text-muted-foreground",
                      active && "border-border bg-surface-soft text-foreground",
                    )}
                  >
                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [folder.id]: !isExpanded,
                        }))
                      }
                      aria-label={
                        isExpanded ? "Collapse folder" : "Expand folder"
                      }
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90",
                        )}
                      />
                    </button>
                    <Link
                      href={`/drive/${folder.id}`}
                      className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-3"
                    >
                      <FolderClosed className="h-4 w-4 shrink-0 text-folder" />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                  </div>
                  {isExpanded && (
                    <SidebarChildren parentId={folder.id} pathname={pathname} />
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
      <div className="shrink-0 border-t border-border p-4">
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("resource:new-folder"))
          }
        >
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </div>
    </aside>
  );
}

function SidebarChildren({
  parentId,
  pathname,
}: {
  parentId: string;
  pathname: string;
}) {
  const children = useFolders(parentId);
  const folders = children.data?.folders ?? [];

  if (children.isLoading || folders.length === 0) return null;

  return (
    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
      {folders.map((folder) => {
        const active = pathname === `/drive/${folder.id}`;
        return (
          <Link
            key={folder.id}
            href={`/drive/${folder.id}`}
            className={cn(
              "flex h-9 min-w-0 items-center gap-2 rounded-[10px] border border-transparent px-3 text-sm text-muted-foreground",
              active && "border-border bg-surface-soft text-foreground",
            )}
          >
            <FolderClosed className="h-4 w-4 shrink-0 text-folder" />
            <span className="truncate">{folder.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
