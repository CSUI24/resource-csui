"use client";

import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolder } from "@/lib/hooks/useFolders";
import type { Folder } from "@/types/folder";

export function BreadcrumbNav({ folderId }: { folderId: string | null }) {
  const folder = useFolder(folderId);
  const breadcrumbs: Folder[] = folderId ? folder.data?.breadcrumbs ?? [] : [];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link className="text-foreground" href="/drive">
            Courses
          </Link>
        </BreadcrumbItem>
        {folderId && folder.isLoading ? (
          <>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <Skeleton className="h-5 w-28" />
          </>
        ) : (
          breadcrumbs.map((item) => (
            <span className="inline-flex items-center gap-1" key={item.id}>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <Link className="text-foreground" href={`/drive/${item.id}`}>
                  {item.name}
                </Link>
              </BreadcrumbItem>
            </span>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
