"use client";

import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from "lucide-react";

import { cn, getExtension, getFileTypeLabel, isImageFile, isPdfFile } from "@/lib/utils";
import type { ResourceFile } from "@/types/file";

export function FileThumbnail({
  file,
  view,
}: {
  file: ResourceFile;
  view: "grid" | "list";
}) {
  const previewUrl = `/api/files/${file.id}/preview`;
  const isGrid = view === "grid";

  if (isImageFile(file.name, file.mimeType)) {
    return (
      <span
        className={cn(
          "block overflow-hidden bg-surface-soft",
          isGrid ? "h-28 w-full rounded-t-[10px]" : "h-11 w-11 shrink-0 rounded-[8px]",
        )}
      >
        <img
          src={previewUrl}
          alt={file.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }

  if (isPdfFile(file.name, file.mimeType)) {
    return <ThumbnailFallback file={file} view={view} />;
  }

  return <ThumbnailFallback file={file} view={view} />;
}

function ThumbnailFallback({
  file,
  view,
}: {
  file: ResourceFile;
  view: "grid" | "list";
}) {
  const isGrid = view === "grid";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-surface-soft text-file",
        isGrid ? "h-28 w-full rounded-t-[10px]" : "h-11 w-11 rounded-[8px]",
      )}
    >
      <span className="relative flex h-full w-full items-center justify-center">
        <FileFallbackIcon
          fileName={file.name}
          className={cn(isGrid ? "h-12 w-12" : "h-5 w-5")}
        />
        {isGrid && (
          <span className="absolute bottom-3 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
            {getFileTypeLabel(file.name)}
          </span>
        )}
      </span>
    </span>
  );
}

function FileFallbackIcon({
  fileName,
  className,
}: {
  fileName: string;
  className?: string;
}) {
  const extension = getExtension(fileName);
  if (extension.includes("ppt")) return <Presentation className={className} />;
  if (extension.includes("xls")) return <FileSpreadsheet className={className} />;
  if (
    extension.includes("png") ||
    extension.includes("jpg") ||
    extension.includes("jpeg")
  ) {
    return <FileImage className={className} />;
  }
  if (extension.includes("zip")) return <FileArchive className={className} />;
  return <FileText className={className} />;
}
