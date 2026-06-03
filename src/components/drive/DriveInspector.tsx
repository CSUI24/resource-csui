"use client";

import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderClosed,
  Presentation,
} from "lucide-react";

import {
  formatBytes,
  formatDate,
  getExtension,
  getFileTypeLabel,
} from "@/lib/utils";
import type { ResourceFile } from "@/types/file";
import type { Folder } from "@/types/folder";

type InspectorTarget =
  | { kind: "folder"; folder: Folder }
  | { kind: "file"; file: ResourceFile }
  | null;

export function DriveInspector({ target }: { target: InspectorTarget }) {
  if (!target) {
    return (
      <aside className="hidden w-72 shrink-0 border-l border-border bg-background px-5 py-8 xl:block">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[12px] bg-surface-soft">
            <FolderClosed className="h-9 w-9 text-folder" />
          </div>
          <div className="text-sm font-medium text-foreground">
            Select an item
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Details appear here
          </div>
        </div>
      </aside>
    );
  }

  if (target.kind === "folder") {
    const folder = target.folder;
    return (
      <aside className="hidden w-72 shrink-0 border-l border-border bg-background px-5 py-8 xl:block">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[12px] bg-[#f5e9d4]">
            <FolderClosed className="h-12 w-12 text-folder" />
          </div>
          <div className="max-w-full truncate text-base font-medium text-foreground">
            {folder.name}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Folder</div>
        </div>
        <InfoBlock
          rows={[
            ["Type", "Folder"],
            ["Items", `${folder.itemCount}`],
            ["Access", "Shared"],
            ["Created by", folder.ownerLabel],
            ["Modified", formatDate(folder.updatedAt)],
            ["Created", formatDate(folder.createdAt)],
          ]}
        />
      </aside>
    );
  }

  const file = target.file;

  return (
    <aside className="hidden w-72 shrink-0 border-l border-border bg-background px-5 py-8 xl:block">
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[12px] bg-surface-soft">
          <FileTypeIcon fileName={file.name} />
        </div>
        <div className="max-w-full truncate text-base font-medium text-foreground">
          {file.name}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {getFileTypeLabel(file.name)}
        </div>
      </div>
      <InfoBlock
        rows={[
          ["Type", getFileTypeLabel(file.name)],
          ["Size", formatBytes(file.sizeBytes)],
          ["Access", "Shared"],
          ["Contributor", file.ownerLabel],
          ["Modified", formatDate(file.updatedAt)],
          ["Created", formatDate(file.createdAt)],
        ]}
      />
    </aside>
  );
}

function InfoBlock({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="mb-4 text-xs font-medium uppercase tracking-[0.08em] text-foreground">
        Info
      </div>
      <dl className="space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[72px_minmax(0,1fr)] gap-3"
          >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="truncate text-xs text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FileTypeIcon({ fileName }: { fileName: string }) {
  const extension = getExtension(fileName);
  if (extension.includes("ppt"))
    return <Presentation className="h-11 w-11 text-file" />;
  if (extension.includes("xls"))
    return <FileSpreadsheet className="h-11 w-11 text-file" />;
  if (
    extension.includes("png") ||
    extension.includes("jpg") ||
    extension.includes("jpeg")
  ) {
    return <FileImage className="h-11 w-11 text-file" />;
  }
  if (extension.includes("zip"))
    return <FileArchive className="h-11 w-11 text-file" />;
  return <FileText className="h-11 w-11 text-file" />;
}
