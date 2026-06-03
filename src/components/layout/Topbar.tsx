"use client";

import { LogOut, Menu, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFolders } from "@/lib/hooks/useFolders";
import { useSession } from "@/lib/hooks/useSession";

export function Topbar() {
  const session = useSession();
  const courses = useFolders(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setMenuOpen(true)}>
        <Menu className="h-4 w-4" />
      </Button>
      <SearchBar className="max-w-xl flex-1" />
      <Button
        variant="secondary"
        className="hidden sm:inline-flex"
        onClick={() => window.dispatchEvent(new CustomEvent("resource:upload"))}
      >
        <Upload className="h-4 w-4" />
        Upload
      </Button>
      <Button onClick={() => window.dispatchEvent(new CustomEvent("resource:new-folder"))}>
        <Plus className="h-4 w-4" />
        New Folder
      </Button>
      <div className="hidden min-w-0 items-center gap-2 border-l border-border pl-4 text-sm lg:flex">
        <span className="truncate text-muted-foreground">{session.data?.user?.name ?? "Student"}</span>
        <Button asChild variant="ghost" size="icon" aria-label="Logout">
          <a href="/api/auth/logout">
            <LogOut className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent className="left-0 right-auto w-80 border-l-0 border-r">
          <SheetHeader>
            <SheetTitle>Courses</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 space-y-1.5">
            {(courses.data?.folders ?? []).map((folder) => (
              <Link
                key={folder.id}
                href={`/drive/${folder.id}`}
                className="block rounded-[10px] border border-transparent px-3 py-2 text-sm text-muted-foreground"
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
