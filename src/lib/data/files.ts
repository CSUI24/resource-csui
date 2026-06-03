import { prisma } from "../prisma";
import { serializeFile } from "../serializers";

export async function listFiles(ownerId: string, folderId: string) {
  const files = await prisma.resourceFile.findMany({
    where: { ownerId, folderId, uploadStatus: "READY" },
    orderBy: { name: "asc" },
  });
  return files.map(serializeFile);
}
