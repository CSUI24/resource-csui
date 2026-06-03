"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileUp, Upload, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { startUpload, updateFile, uploadToSignedUrl } from "@/lib/api/files";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { cn, formatBytes, isAcceptedFileName } from "@/lib/utils";
import { useSession } from "@/lib/hooks/useSession";
import type { ResourceFileMetadata } from "@/types/file";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";

interface UploadRow {
  id: string;
  file: File;
  progress: number;
  status: "ready" | "uploading" | "done" | "error";
  metadata: ResourceFileMetadata & { tagsText?: string };
}

export function UploadDialog({
  open,
  folderId,
  initialFiles,
  onOpenChange,
}: {
  open: boolean;
  folderId: string | null;
  initialFiles: File[];
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<UploadRow[]>(() => createRows(initialFiles));
  const [uploading, setUploading] = useState(false);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [contributorVisibility, setContributorVisibility] =
    useState<NonNullable<ResourceFileMetadata["contributorVisibility"]>>(
      "initials",
    );

  const invalid = useMemo(
    () =>
      rows.some(
        (row) =>
          !isAcceptedFileName(row.file.name) ||
          row.file.size > MAX_FILE_SIZE_BYTES,
      ),
    [rows],
  );

  async function uploadAll() {
    if (!folderId) {
      toast.error("Open a folder first");
      return;
    }

    let hasError = false;
    let completed = 0;
    setUploading(true);

    try {
      for (const row of rows) {
        if (
          !isAcceptedFileName(row.file.name) ||
          row.file.size > MAX_FILE_SIZE_BYTES
        ) {
          hasError = true;
          setRows((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, status: "error" } : item,
            ),
          );
          continue;
        }

        try {
          setRows((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, status: "uploading" } : item,
            ),
          );
          const ticket = await startUpload({
            name: row.file.name,
            folderId,
            mimeType: row.file.type || "application/octet-stream",
            sizeBytes: row.file.size,
            metadata: cleanMetadata(row.metadata, contributorVisibility),
          });
          await uploadToSignedUrl(
            row.file,
            ticket.uploadUrl,
            ticket.headers,
            (progress) => {
              setRows((current) =>
                current.map((item) =>
                  item.id === row.id ? { ...item, progress } : item,
                ),
              );
            },
          );
          await updateFile(ticket.file.id, { uploadStatus: "READY" });
          completed += 1;
          setRows((current) =>
            current.map((item) =>
              item.id === row.id
                ? { ...item, status: "done", progress: 100 }
                : item,
            ),
          );
        } catch (cause) {
          hasError = true;
          toast.error(cause instanceof Error ? cause.message : "Upload failed");
          setRows((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, status: "error" } : item,
            ),
          );
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["files", folderId] });
      await queryClient.invalidateQueries({ queryKey: ["folders"] });

      if (!hasError && completed === rows.length) {
        toast.success(completed === 1 ? "Upload complete" : "Uploads complete");
        onOpenChange(false);
      }
    } finally {
      setUploading(false);
    }
  }

  function patchMetadata(id: string, metadata: Partial<UploadRow["metadata"]>) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, metadata: { ...row.metadata, ...metadata } }
          : row,
      ),
    );
  }

  function addFiles(files: File[]) {
    if (files.length === 0) return;
    setRows((current) => [...current, ...createRows(files, current.length)]);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsModalDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !uploading && onOpenChange(nextOpen)}
    >
      <DialogContent className="max-w-3xl gap-5">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          multiple
          accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = "";
          }}
        />

        <div
          className={cn(
            "rounded-[12px] border border-dashed border-border bg-surface-soft px-5 py-4",
            isModalDragging && "border-ring bg-background",
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsModalDragging(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) setIsModalDragging(false);
          }}
          onDrop={handleDrop}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-background">
              <FileUp className="h-5 w-5 text-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">
                {rows.length > 0
                  ? `${rows.length} file${rows.length > 1 ? "s" : ""} ready`
                  : "Drop files here"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                PDF, Office files, images, and ZIP. Max 50 MB each.
              </div>
            </div>
            <Button
              variant="secondary"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose files
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[10px] border border-border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">
              Contributor display
            </div>
            <div className="mt-1 truncate text-xs text-muted-foreground">
              Shown as{" "}
              {getContributorPreview(
                session.data?.user?.name ??
                  session.data?.user?.username ??
                  "Student",
                contributorVisibility,
              )}
            </div>
          </div>
          <div className="inline-flex rounded-full border border-border bg-surface-soft p-0.5">
            <button
              type="button"
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
                contributorVisibility === "initials" &&
                  "bg-background text-foreground",
              )}
              onClick={() => setContributorVisibility("initials")}
            >
              Initials
            </button>
            <button
              type="button"
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
                contributorVisibility === "full" &&
                  "bg-background text-foreground",
              )}
              onClick={() => setContributorVisibility("full")}
            >
              Full name
            </button>
          </div>
        </div>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {rows.length === 0 ? (
            <div
              className="flex min-h-44 flex-col items-center justify-center rounded-[10px] border border-border bg-background text-center text-sm text-muted-foreground"
              onDragOver={(event) => {
                event.preventDefault();
                setIsModalDragging(true);
              }}
              onDrop={handleDrop}
            >
              <FileUp className="mb-3 h-6 w-6 text-muted-foreground" />
              <div>No files selected</div>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose files
              </button>
            </div>
          ) : (
            rows.map((row) => {
              const rowInvalid =
                !isAcceptedFileName(row.file.name) ||
                row.file.size > MAX_FILE_SIZE_BYTES;
              return (
                <div
                  key={row.id}
                  className={cn(
                    "rounded-[10px] border border-border bg-background p-4",
                    row.status === "error" && "border-destructive",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {row.file.name}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatBytes(row.file.size)}
                          </div>
                        </div>
                        <UploadStatusBadge
                          status={rowInvalid ? "error" : row.status}
                        />
                      </div>
                      <Progress className="mt-3 h-1.5" value={row.progress} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={row.metadata.description ?? ""}
                        onChange={(event) =>
                          patchMetadata(row.id, {
                            description: event.target.value,
                          })
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Week</Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.metadata.week ?? ""}
                        placeholder="Optional"
                        onChange={(event) =>
                          patchMetadata(row.id, {
                            week: event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lecturer</Label>
                      <Input
                        value={row.metadata.lecturer ?? ""}
                        onChange={(event) =>
                          patchMetadata(row.id, {
                            lecturer: event.target.value,
                          })
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Tags</Label>
                      <Input
                        value={row.metadata.tagsText ?? ""}
                        onChange={(event) =>
                          patchMetadata(row.id, {
                            tagsText: event.target.value,
                          })
                        }
                        placeholder="Comma separated (Optional)"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            disabled={uploading || rows.length === 0 || invalid}
            onClick={uploadAll}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadStatusBadge({ status }: { status: UploadRow["status"] }) {
  if (status === "done") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-[6px] border border-border bg-surface-soft px-2 py-1 text-xs text-foreground">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Done
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-[6px] border border-destructive bg-background px-2 py-1 text-xs text-destructive">
        <XCircle className="h-3.5 w-3.5" />
        Check file
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center rounded-[6px] border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
      {status === "uploading" ? "Uploading" : "Ready"}
    </span>
  );
}

function cleanMetadata(
  metadata: UploadRow["metadata"],
  contributorVisibility: NonNullable<
    ResourceFileMetadata["contributorVisibility"]
  >,
): ResourceFileMetadata {
  return {
    description: metadata.description || undefined,
    week: metadata.week || undefined,
    lecturer: metadata.lecturer || undefined,
    contributorVisibility,
    tags: metadata.tagsText
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function createRows(files: File[], offset = 0): UploadRow[] {
  return files.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${offset + index}-${crypto.randomUUID()}`,
    file,
    progress: 0,
    status: "ready",
    metadata: {},
  }));
}

function getContributorPreview(
  name: string,
  visibility: NonNullable<ResourceFileMetadata["contributorVisibility"]>,
) {
  if (visibility === "full") return name;
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => `${part[0]?.toUpperCase() ?? "U"}***`)
    .join(" ");
}
