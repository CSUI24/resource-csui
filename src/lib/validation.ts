import { z } from "zod";

import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "./constants";
import { getExtension } from "./utils";

export const folderNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(80, "Name is too long");

export const fileMetadataSchema = z.object({
  description: z.string().trim().max(500).optional().or(z.literal("")),
  week: z.coerce.number().int().min(1).max(24).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(32)).max(12).optional(),
  lecturer: z.string().trim().max(120).optional().or(z.literal("")),
});

export const createFolderSchema = z.object({
  name: folderNameSchema,
  parentId: z.string().nullable().optional(),
});

export const renameSchema = z.object({
  name: folderNameSchema,
});

export const createFileSchema = z.object({
  name: z.string().trim().min(1).max(180),
  folderId: z.string().min(1),
  mimeType: z.string().trim().min(1),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  metadata: fileMetadataSchema.optional(),
});

export const updateFileSchema = z.object({
  name: z.string().trim().min(1).max(180).optional(),
  metadata: fileMetadataSchema.optional(),
  uploadStatus: z.enum(["READY", "FAILED"]).optional(),
});

export function validateUploadName(name: string) {
  const extension = getExtension(name);
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]);
}
