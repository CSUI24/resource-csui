"use client";

import { Document, Page, pdfjs } from "react-pdf";

import { cn } from "@/lib/utils";
import type { ResourceFile } from "@/types/file";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfThumbnail({
  file,
  previewUrl,
  view,
}: {
  file: ResourceFile;
  previewUrl: string;
  view: "grid" | "list";
}) {
  const isGrid = view === "grid";
  const fallback = <PdfThumbnailFallback view={view} />;

  return (
    <span
      className={cn(
        "flex overflow-hidden bg-surface-soft",
        isGrid
          ? "h-28 w-full items-start justify-center rounded-t-[10px]"
          : "h-11 w-11 shrink-0 items-center justify-center rounded-[8px]",
      )}
      aria-label={`${file.name} thumbnail`}
    >
      <Document
        file={previewUrl}
        loading={fallback}
        error={fallback}
        noData={fallback}
      >
        <Page
          pageNumber={1}
          width={isGrid ? 132 : 44}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </span>
  );
}

function PdfThumbnailFallback({ view }: { view: "grid" | "list" }) {
  const isGrid = view === "grid";
  return (
    <span
      className={cn(
        "block animate-pulse bg-surface-strong/70",
        isGrid ? "h-28 w-full" : "h-11 w-11",
      )}
    />
  );
}
