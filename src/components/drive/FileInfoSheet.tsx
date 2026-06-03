"use client";

import { Copy, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteFile, useUpdateFile } from "@/lib/hooks/useFiles";
import { formatBytes, formatDate, getFileTypeLabel } from "@/lib/utils";
import type { ResourceFile } from "@/types/file";

export function FileInfoSheet({
  file,
  folderId,
  open,
  onOpenChange,
}: {
  file: ResourceFile | null;
  folderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!file) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-lg">
        <SheetHeader>
          <SheetTitle>File Info</SheetTitle>
        </SheetHeader>
        <FileInfoForm key={file.id} file={file} folderId={folderId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function FileInfoForm({
  file,
  folderId,
  onOpenChange,
}: {
  file: ResourceFile;
  folderId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateFile(folderId);
  const remove = useDeleteFile(folderId);
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState(file.metadata.description ?? "");
  const [week, setWeek] = useState(file.metadata.week ? String(file.metadata.week) : "");
  const [lecturer, setLecturer] = useState(file.metadata.lecturer ?? "");
  const [tags, setTags] = useState(file.metadata.tags?.join(", ") ?? "");

  return (
    <div className="mt-6 space-y-5">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-[10px] border border-border bg-surface-soft p-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Type</div>
          <div className="mt-1 truncate text-foreground">{getFileTypeLabel(file.name)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Size</div>
          <div className="mt-1 truncate text-foreground">{formatBytes(file.sizeBytes)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Created</div>
          <div className="mt-1 truncate text-foreground">{formatDate(file.createdAt)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Updated</div>
          <div className="mt-1 truncate text-foreground">{formatDate(file.updatedAt)}</div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Week</Label>
          <Input type="number" value={week} onChange={(event) => setWeek(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Lecturer</Label>
          <Input value={lecturer} onChange={(event) => setLecturer(event.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tags</Label>
        <Input value={tags} onChange={(event) => setTags(event.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          onClick={() =>
            update.mutate({
              fileId: file.id,
              input: {
                name,
                metadata: {
                  description,
                  week: week ? Number(week) : undefined,
                  lecturer,
                  tags: tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                },
              },
            })
          }
        >
          Save
        </Button>
        <Button asChild variant="secondary">
          <a href={`/api/files/${file.id}/download`}>
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            void navigator.clipboard.writeText(`${window.location.origin}/api/files/${file.id}/download`);
            toast.success("Link copied");
          }}
        >
          <Copy className="h-4 w-4" />
          Copy link
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            remove.mutate(file.id);
            onOpenChange(false);
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
