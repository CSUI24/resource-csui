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
  selectedFolder,
  selectedFile,
  view,
  onSelectFolder,
  onSelectFile,
  onNewFolder,
  onFolderContext,
  onFileContext,
}: {
  folders: Folder[];
  files: ResourceFile[];
  selectedFolder: Folder | null;
  selectedFile: ResourceFile | null;
  view: "grid" | "list";
  onSelectFolder: (folder: Folder) => void;
  onSelectFile: (file: ResourceFile) => void;
  onNewFolder: () => void;
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
      className="space-y-8"
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-medium leading-8 text-foreground">Folders</h2>
        <div
          className={
            view === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
              : "space-y-2 rounded-[10px] border border-border bg-background p-2"
          }
        >
          {folders.map((folder) => (
            <div key={folder.id} className="drive-item min-w-0">
              <FolderCard
                folder={folder}
                view={view}
                selected={selectedFolder?.id === folder.id}
                onSelect={onSelectFolder}
                onContextMenu={onFolderContext}
              />
            </div>
          ))}
          <button
            type="button"
            className={
              view === "grid"
                ? "drive-item flex h-40 min-w-0 flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-border bg-background text-sm font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "drive-item flex h-14 min-w-0 items-center justify-center gap-3 rounded-[10px] border border-dashed border-border bg-background text-sm font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
            onClick={onNewFolder}
          >
            <span className="text-2xl leading-none text-foreground">+</span>
            New Folder
          </button>
        </div>
      </section>

      {files.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-medium leading-8 text-foreground">Files</h2>
          <div
            className={
              view === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                : "space-y-2 rounded-[10px] border border-border bg-background p-2"
            }
          >
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
        </section>
      )}
    </div>
  );
}
