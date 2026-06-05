"use client";

import dynamic from "next/dynamic";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cn,
  formatBytes,
  getFileTypeLabel,
  isImageFile,
  isPdfFile,
  isPresentationFile,
} from "@/lib/utils";
import type { ResourceFile } from "@/types/file";

type OfficeViewerProps = {
  url: string;
  fileName: string;
};

const OfficeViewer = dynamic<OfficeViewerProps>(
  async () => {
    const mod = await import("@cyntler/react-doc-viewer");
    return function OfficeViewerInner({ url, fileName }: OfficeViewerProps) {
      return (
        <mod.default
          documents={[{ uri: url, fileName }]}
          pluginRenderers={mod.DocViewerRenderers}
          config={{
            header: { disableHeader: true, retainURLParams: true },
            loadingRenderer: {
              overrideComponent: () => <PreviewSkeleton />,
            },
            noRenderer: {
              overrideComponent: () => (
                <UnsupportedPreview fileName={fileName} compact />
              ),
            },
          }}
          style={{ height: "100%", width: "100%" }}
        />
      );
    };
  },
  {
    ssr: false,
    loading: () => <PreviewSkeleton />,
  },
);

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: {
  file: ResourceFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const previewUrl = file ? `/api/files/${file.id}/preview` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100dvh-32px)] max-h-[900px] max-w-[min(1180px,calc(100vw-32px))] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0">
        {file && (
          <>
            <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b border-border px-5 py-4 pr-12">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base">
                  {file.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  File preview and download actions for {file.name}.
                </DialogDescription>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {getFileTypeLabel(file.name)} · {formatBytes(file.sizeBytes)} · {file.ownerLabel}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="secondary" size="sm">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open preview in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="sm">
                  <a href={`/api/files/${file.id}/download`}>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </DialogHeader>
            <div className="min-h-0 bg-surface-soft">
              <PreviewSurface file={file} previewUrl={previewUrl} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewSurface({
  file,
  previewUrl,
}: {
  file: ResourceFile;
  previewUrl: string;
}) {
  if (isImageFile(file.name, file.mimeType)) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <img
          src={previewUrl}
          alt={file.name}
          className="max-h-full max-w-full rounded-[10px] object-contain shadow-sm"
        />
      </div>
    );
  }

  if (isPdfFile(file.name, file.mimeType)) {
    return <PdfBrowserPreview fileName={file.name} previewUrl={previewUrl} />;
  }

  if (isPresentationFile(file.name, file.mimeType)) {
    return <OfficePreview file={file} />;
  }

  return <UnsupportedPreview fileName={file.name} />;
}

function PdfBrowserPreview({
  fileName,
  previewUrl,
}: {
  fileName: string;
  previewUrl: string;
}) {
  return (
    <div className="h-full bg-background p-3">
      <iframe
        title={fileName}
        src={previewUrl}
        className="h-full w-full rounded-[10px] border border-border bg-background"
      />
    </div>
  );
}

function OfficePreview({ file }: { file: ResourceFile }) {
  const [previewState, setPreviewState] = useState<{
    fileId: string;
    url: string | null;
    error: boolean;
  }>({ fileId: "", url: null, error: false });

  useEffect(() => {
    let active = true;

    fetch(`/api/files/${file.id}/preview-url`)
      .then((response) => {
        if (!response.ok) throw new Error("Preview URL failed");
        return response.json() as Promise<{ url: string }>;
      })
      .then((body) => {
        if (active)
          setPreviewState({ fileId: file.id, url: body.url, error: false });
      })
      .catch(() => {
        if (active)
          setPreviewState({ fileId: file.id, url: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [file.id]);

  const activePreview =
    previewState.fileId === file.id
      ? previewState
      : { fileId: file.id, url: null, error: false };

  if (activePreview.error) return <UnsupportedPreview fileName={file.name} />;
  if (!activePreview.url) return <PreviewSkeleton />;

  return (
    <div className="h-full bg-background p-3">
      <div className="h-full overflow-hidden rounded-[10px] border border-border">
        <OfficeViewer url={activePreview.url} fileName={file.name} />
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[52dvh] w-full rounded-[10px]" />
      </div>
    </div>
  );
}

function UnsupportedPreview({
  fileName,
  compact = false,
}: {
  fileName: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[320px] items-center justify-center p-6 text-center",
        compact && "min-h-52",
      )}
    >
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-surface-soft text-file">
          <FileText className="h-7 w-7" />
        </div>
        <div className="text-sm font-medium text-foreground">{fileName}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Preview unavailable. Use Download to open this file.
        </div>
      </div>
    </div>
  );
}
