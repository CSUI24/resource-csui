import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { ACCEPTED_EXTENSIONS, FILE_TYPE_LABELS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getExtension(name: string) {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index).toLowerCase();
}

export function isAcceptedFileName(name: string) {
  return ACCEPTED_EXTENSIONS.includes(getExtension(name) as (typeof ACCEPTED_EXTENSIONS)[number]);
}

export function getFileTypeLabel(name: string) {
  const extension = getExtension(name).replace(".", "");
  return FILE_TYPE_LABELS[extension] ?? "File";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
