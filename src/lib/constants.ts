export const APP_NAME = "Pacil Resource";

export const SESSION_COOKIE = "session";
export const DEV_SESSION_COOKIE = "dev_session";
export const DEFAULT_FOLDER_NAMES = [
  "Materi",
  "UTS",
  "UAS",
  "Kuis",
  "Tugas",
] as const;

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".ppt",
  ".pptx",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  ppt: "Slides",
  pptx: "Slides",
  doc: "Doc",
  docx: "Doc",
  xls: "Sheet",
  xlsx: "Sheet",
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
  zip: "Archive",
};

export const QUERY_STALE = {
  workspace: 20_000,
  search: 15_000,
  session: 5 * 60_000,
};
