"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfViewer({
  fileName,
  previewUrl,
}: {
  fileName: string;
  previewUrl: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(760);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setWidth(Math.min(entry.contentRect.width - 32, 920));
    });
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-center gap-2 border-b border-border bg-background px-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-24 text-center text-xs text-muted-foreground">
          {numPages > 0 ? `${pageNumber} / ${numPages}` : "Loading"}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={numPages === 0 || pageNumber >= numPages}
          onClick={() =>
            setPageNumber((value) => Math.min(numPages, value + 1))
          }
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mx-auto flex min-h-full w-full justify-center">
          <Document
            file={previewUrl}
            loading={<PdfViewerSkeleton />}
            error={<PdfViewerFallback fileName={fileName} />}
            onLoadSuccess={({ numPages: nextNumPages }) => {
              setNumPages(nextNumPages);
              setPageNumber(1);
            }}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.max(280, width)}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}

function PdfViewerSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-3">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-[52dvh] w-full rounded-[10px]" />
    </div>
  );
}

function PdfViewerFallback({ fileName }: { fileName: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6 text-center">
      <div>
        <div className="text-sm font-medium text-foreground">{fileName}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Preview unavailable. Use Download to open this file.
        </div>
      </div>
    </div>
  );
}
