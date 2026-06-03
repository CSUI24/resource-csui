import { DriveWorkspace } from "@/components/drive/DriveWorkspace";

export default async function FolderPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = await params;
  return <DriveWorkspace folderId={folderId} />;
}
