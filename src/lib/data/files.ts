import { prisma } from "../prisma";
import { serializeFile } from "../serializers";

export async function listFiles(folderId: string) {
  const files = await prisma.resourceFile.findMany({
    where: { folderId, uploadStatus: "READY" },
    orderBy: { name: "asc" },
  });
  return files.map(serializeFile);
}
