"use client";

import { FolderClosed } from "lucide-react";
import Link from "next/link";

import { SearchBar } from "@/components/shared/SearchBar";
import { SearchSkeleton } from "@/components/shared/LoadingSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/lib/hooks/useSearch";
import { formatBytes, formatDate } from "@/lib/utils";

export function SearchResults({ query }: { query: string }) {
  const results = useSearch(query);
  const folders = results.data?.folders ?? [];
  const files = results.data?.files ?? [];

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-surface-soft px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <h1 className="text-xl font-medium leading-7 text-foreground">Search</h1>
          <SearchBar className="w-full max-w-xl" initialValue={query} />
        </div>
        {results.isLoading ? (
          <SearchSkeleton />
        ) : !query.trim() ? (
          <EmptyState label="Enter a search term" />
        ) : folders.length === 0 && files.length === 0 ? (
          <EmptyState label="No results" />
        ) : (
          <div className="space-y-2 rounded-[10px] border border-border bg-background p-2">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/drive/${folder.id}`}
                className="flex min-w-0 items-center gap-3 rounded-[10px] border border-transparent bg-background p-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft">
                  <FolderClosed className="h-5 w-5 text-folder" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{folder.name}</div>
                  <div className="text-xs text-muted-foreground">{folder.itemCount} items</div>
                </div>
                <Badge>Folder</Badge>
              </Link>
            ))}
            {files.map((file) => (
              <a
                key={file.id}
                href={`/api/files/${file.id}/download`}
                className="flex min-w-0 items-center gap-3 rounded-[10px] border border-transparent bg-background p-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft text-sm font-medium text-file">
                  F
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {formatBytes(file.sizeBytes)} · {formatDate(file.updatedAt)}
                  </div>
                </div>
                <Badge>File</Badge>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
