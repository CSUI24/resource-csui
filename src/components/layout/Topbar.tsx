"use client";

import { ChevronDown, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFolders } from "@/lib/hooks/useFolders";
import { useSession } from "@/lib/hooks/useSession";
import { cn } from "@/lib/utils";

export function Topbar() {
  const session = useSession();
  const courses = useFolders(null);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDriveRoot = pathname === "/drive";
  const title = pathname.startsWith("/search") ? "Search" : isDriveRoot ? "Courses" : "Folders";
  const subtitle = pathname.startsWith("/search")
    ? "Find shared resources"
    : isDriveRoot
      ? "Shared course roots"
      : "Course materials and files";
  const user = session.data?.user;
  const initials = useMemo(() => getInitials(user?.name ?? user?.username ?? "Student"), [user?.name, user?.username]);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setMenuOpen(true)}>
        <Menu className="h-4 w-4" />
      </Button>
      <div className="hidden min-w-0 flex-col lg:flex">
        <div className="truncate text-base font-medium leading-5 text-foreground">{title}</div>
        <div className="truncate text-xs leading-4 text-muted-foreground">{subtitle}</div>
      </div>
      <SearchBar className="mx-auto hidden max-w-xl flex-1 md:block" placeholder="Search all resources" />
      <div className="ml-auto flex min-w-0 items-center gap-3">
        <SearchBar className="block w-40 sm:w-56 md:hidden" placeholder="Search" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-xs font-medium text-foreground">
                {initials}
              </span>
              <span className="hidden max-w-36 truncate text-sm text-muted-foreground lg:block">
                {user?.name ?? "Student"}
              </span>
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2">
              <div className="truncate text-sm font-medium text-foreground">{user?.name ?? "Student"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email ?? user?.username ?? "Signed in"}</div>
            </div>
            {/* <DropdownMenuSeparator className="my-1 h-px bg-border" /> */}
            
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent className="left-0 right-auto w-80 border-l-0 border-r">
          <SheetHeader>
            <SheetTitle>Resource CSUI</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 space-y-1.5">
            {(courses.data?.folders ?? []).map((folder) => (
              <Link
                key={folder.id}
                href={`/drive/${folder.id}`}
                className={cn(
                  "block rounded-[10px] border border-transparent px-3 py-2 text-sm text-muted-foreground",
                  pathname === `/drive/${folder.id}` && "border-border bg-surface-soft text-foreground",
                )}
                onClick={() => setMenuOpen(false)}
              >
                {folder.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
