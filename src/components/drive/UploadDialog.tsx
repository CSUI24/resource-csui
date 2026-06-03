"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { startUpload, updateFile, uploadToSignedUrl } from "@/lib/api/files";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { isAcceptedFileName } from "@/lib/utils";
import type { ResourceFileMetadata } from "@/types/file";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
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
  const [rows, setRows] = useState<UploadRow[]>(() => createRows(initialFiles));
  const [uploading, setUploading] = useState(false);

  const invalid = useMemo(
    () => rows.some((row) => !isAcceptedFileName(row.file.name) || row.file.size > MAX_FILE_SIZE_BYTES),
    [rows],
  );

  async function uploadAll() {
    if (!folderId) {
      toast.error("Open a folder first");
      return;
    }
    setUploading(true);

    for (const row of rows) {
      if (!isAcceptedFileName(row.file.name) || row.file.size > MAX_FILE_SIZE_BYTES) {
        setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: "error" } : item)));
        continue;
      }

      try {
        setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: "uploading" } : item)));
        const ticket = await startUpload({
          name: row.file.name,
          folderId,
          mimeType: row.file.type || "application/octet-stream",
          sizeBytes: row.file.size,
          metadata: cleanMetadata(row.metadata),
        });
        await uploadToSignedUrl(row.file, ticket.uploadUrl, ticket.headers, (progress) => {
          setRows((current) => current.map((item) => (item.id === row.id ? { ...item, progress } : item)));
        });
        await updateFile(ticket.file.id, { uploadStatus: "READY" });
        setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: "done", progress: 100 } : item)));
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : "Upload failed");
        setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status: "error" } : item)));
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["files", folderId] });
    await queryClient.invalidateQueries({ queryKey: ["folders"] });
    setUploading(false);
  }

  function patchMetadata(id: string, metadata: Partial<UploadRow["metadata"]>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, metadata: { ...row.metadata, ...metadata } } : row)),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload</DialogTitle>
        </DialogHeader>
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {rows.map((row) => {
            const rowInvalid = !isAcceptedFileName(row.file.name) || row.file.size > MAX_FILE_SIZE_BYTES;
            return (
              <div key={row.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rowInvalid ? "Unsupported or over 50 MB" : row.status}
                    </div>
                  </div>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <Progress className="mt-3" value={row.progress} />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={row.metadata.description ?? ""}
                      onChange={(event) => patchMetadata(row.id, { description: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Week</Label>
                    <Input
                      type="number"
                      min={1}
                      value={row.metadata.week ?? ""}
                      onChange={(event) =>
                        patchMetadata(row.id, { week: event.target.value ? Number(event.target.value) : undefined })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lecturer</Label>
                    <Input
                      value={row.metadata.lecturer ?? ""}
                      onChange={(event) => patchMetadata(row.id, { lecturer: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Tags</Label>
                    <Input
                      value={row.metadata.tagsText ?? ""}
                      onChange={(event) => patchMetadata(row.id, { tagsText: event.target.value })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={uploading || rows.length === 0 || invalid} onClick={uploadAll}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cleanMetadata(metadata: UploadRow["metadata"]): ResourceFileMetadata {
  return {
    description: metadata.description || undefined,
    week: metadata.week || undefined,
    lecturer: metadata.lecturer || undefined,
    tags: metadata.tagsText
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function createRows(files: File[]): UploadRow[] {
  return files.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}`,
    file,
    progress: 0,
    status: "ready",
    metadata: {},
  }));
}
