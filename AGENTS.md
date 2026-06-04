<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- Spesification -->
# Academic Resource Hub — Specification

## What We're Building

A file management app for university students — think Google Drive, but scoped to courses. Users log in via SSO and land directly in their workspace. No marketing, no onboarding friction.

---

## User Mental Model


A student opens the app and sees their courses as folders. Inside each course: **Materi** and **UAS** (always there, can't be removed). They can add more subfolders, upload files, and find anything fast.

That's it. The UI should never make them think harder than that.

---

## UX Principles

These govern every design and interaction decision:

- **Visibility of system status** — always show what's happening (upload progress, loading states, errors).
- **Match the real world** — use folder/file metaphors students already know.
- **User control** — easy undo, no destructive actions without confirmation.
- **Consistency** — same interaction patterns everywhere. Right-click always opens a context menu. Single-click selects/previews. Double-click opens.
- **Error prevention** — disable irrelevant actions (e.g. hide rename/delete on default subfolders) rather than showing errors after the fact.
- **Recognition over recall** — breadcrumbs always visible. Active folder highlighted in sidebar.
- **Minimalism** — show only what's needed for the current task. No decorative copy, no empty labels.

---

## Authentication

`middleware.ts` redirects any unauthenticated request to SSO login. There is no landing page. After login, users land on `/drive`.

SSO integration details: see `/docs/sso-integration.md`. Stub with `// TODO: SSO` comments.

---

## Project Structure

```
app/
  (auth)/callback/page.tsx
  (dashboard)/
    layout.tsx                  # sidebar + topbar shell
    page.tsx                    # redirects to /drive
    drive/
      page.tsx                  # course list
      [folderId]/page.tsx       # folder contents
    search/page.tsx
  api/
    auth/[...sso]/route.ts
    folders/route.ts
    folders/[folderId]/route.ts
    files/route.ts
    files/[fileId]/route.ts

components/
  ui/                           # shadcn/ui (generated)
  layout/
    Sidebar.tsx
    Topbar.tsx
    BreadcrumbNav.tsx
  drive/
    DriveGrid.tsx
    FolderCard.tsx
    FileCard.tsx
    DropZone.tsx
    NewFolderDialog.tsx
    UploadDialog.tsx
    FileInfoSheet.tsx
    RenameDialog.tsx
    ContextMenu.tsx
  shared/
    EmptyState.tsx
    LoadingSkeletons.tsx
    SearchBar.tsx

lib/
  api/                          # typed fetch wrappers
  auth/                         # session helpers
  hooks/
    useFolders.ts
    useFiles.ts
    useDragDrop.ts
  utils/
  constants.ts

types/
  folder.ts
  file.ts
  user.ts

middleware.ts
```

---

## Data Models

```ts
interface Folder {
  id: string;
  name: string;
  parentId: string | null;      // null = course root
  ownerId: string;
  isDefault: boolean;           // Materi & UAS are protected
  createdAt: string;
  updatedAt: string;
}

interface ResourceFile {
  id: string;
  name: string;
  folderId: string;
  ownerId: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  metadata: {
    description?: string;
    week?: number;
    tags?: string[];
    lecturer?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
```

---

## Features

### Drive View

Grid of folders and files. Breadcrumb at top. Toggle grid/list (persist to `localStorage`). Sort by name or date.

**Interactions:**
- Single-click file → opens `FileInfoSheet` (right side panel)
- Double-click file → download/open
- Double-click folder → navigate in
- Right-click anything → context menu
- Drag files from desktop → drop anywhere on canvas to upload

**Folder cards:** icon, name, item count.
**File cards:** type icon (color-coded by type), name, size, date.

### Folder Creation

New Folder button (topbar + right-click canvas). One input: folder name. On create, if it's a course root (`parentId === null`), auto-create `Materi` and `UAS` inside it.

`Materi` and `UAS` have no rename or delete option — not hidden behind a disabled state, simply absent from their context menus.

### File Upload

Drop files anywhere on the canvas. Or use the Upload button. Both open `UploadDialog`.

`UploadDialog` shows each file with optional metadata: description, week number, tags, lecturer. All optional — don't force it. Shows upload progress per file.

Accepted: `.pdf .ppt .pptx .doc .docx .xls .xlsx .png .jpg .zip` — max 50 MB each.

### File Info Sheet

Slides in from the right on file click. Shows: name (inline editable), type, size, dates, metadata fields, uploader. Actions: Download, Copy link, Delete.

### Search

`Cmd/Ctrl+K` or search bar in topbar. Searches names, descriptions, tags. Results at `/search?q=`.

### Sidebar

Lists all course folders. Active state visible. Collapses on mobile. New Folder shortcut at bottom.

---

## UI Guidelines

**Aesthetic:** Clean, neutral, task-focused. No decorative elements. Let content breathe.

**Copy rules:**
- Labels, not sentences. "Upload" not "Upload your files here".
- No tooltips that repeat what a button already says.
- Empty states get one short line + one action, nothing else.
- Error messages say what happened and what to do, in plain language.

**shadcn/ui component map:**

| Interaction | Component |
|---|---|
| Context menus | `DropdownMenu` |
| Dialogs (create, rename, upload) | `Dialog` |
| File info panel | `Sheet` |
| Toast notifications | `Sonner` |
| Breadcrumb | `Breadcrumb` |
| Grid/list toggle | `ToggleGroup` |
| Sort | `Select` |
| Tags | `Badge` |
| Upload progress | `Progress` |
| Loading | `Skeleton` |
| Delete confirmation | `AlertDialog` |

**Styling:** Tailwind CSS + CSS variables in `globals.css`. Dark mode via `next-themes`. Sidebar collapses on `< lg`.

---

## Stack

| | |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript strict |
| UI | shadcn/ui + Tailwind |
| Server state | TanStack Query |
| Drag & drop | Native HTML5 DnD or `@hello-pangea/dnd` |
| Forms | `react-hook-form` + `zod` |
| Auth | SSO (see integration doc) |

---

## Out of Scope

- File preview in-app
- Real-time collaboration
- Role-based permissions
- Activity log
- Backend / DB setup

---

## Agent Notes

1. No landing page. `/` → `/drive` or SSO redirect.
2. All UI from shadcn/ui — no custom equivalents.
3. Follow the folder structure exactly.
4. `Materi` and `UAS` are immutable — enforce in both UI and API.
5. No `any` types. All responses typed.
6. SSO is a stub — `// TODO: integrate SSO per /docs/sso-integration.md`.
7. Drag-and-drop target is the entire canvas, not a widget.
<!-- END Spesification -->

<!-- Design -->
Follow instruction on file '/DESIGN.md' for coloring layouting and etc
<!--  -->