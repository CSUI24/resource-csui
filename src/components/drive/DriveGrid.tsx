"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { FolderCard } from "@/components/drive/FolderCard";
import { FileCard } from "@/components/drive/FileCard";
import type { ResourceFile } from "@/types/file";
import type { Folder } from "@/types/folder";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function DriveGrid({
  folders,
  files,
  selectedFile,
  view,
  onSelectFile,
  onFolderContext,
  onFileContext,
}: {
  folders: Folder[];
  files: ResourceFile[];
  selectedFile: ResourceFile | null;
  view: "grid" | "list";
  onSelectFile: (file: ResourceFile) => void;
  onFolderContext: (event: React.MouseEvent, folder: Folder) => void;
  onFileContext: (event: React.MouseEvent, file: ResourceFile) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".drive-item", { opacity: 0, y: 8, duration: 0.25, stagger: 0.025, ease: "power1.out" });
    },
    { scope: containerRef, dependencies: [folders.length, files.length, view], revertOnUpdate: true },
  );

  return (
    <div
      ref={containerRef}
      className={view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-2"}
    >
      {folders.map((folder) => (
        <div key={folder.id} className="drive-item min-w-0">
          <FolderCard folder={folder} view={view} onContextMenu={onFolderContext} />
        </div>
      ))}
      {files.map((file) => (
        <div key={file.id} className="drive-item min-w-0">
          <FileCard
            file={file}
            view={view}
            selected={selectedFile?.id === file.id}
            onSelect={onSelectFile}
            onContextMenu={onFileContext}
          />
        </div>
      ))}
    </div>
  );
}
