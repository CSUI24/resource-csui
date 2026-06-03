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
    <main className="min-h-[calc(100dvh-56px)] p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-medium">Search</h1>
          <SearchBar className="w-full max-w-md" initialValue={query} />
        </div>
        {results.isLoading ? (
          <SearchSkeleton />
        ) : !query.trim() ? (
          <EmptyState label="Enter a search term" />
        ) : folders.length === 0 && files.length === 0 ? (
          <EmptyState label="No results" />
        ) : (
          <div className="space-y-2">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/drive/${folder.id}`}
                className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
              >
                <FolderClosed className="h-5 w-5 text-folder" />
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
                className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-sm font-medium text-file">
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
