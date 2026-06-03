import { DEFAULT_FOLDER_NAMES } from "../constants";
import { prisma } from "../prisma";
import { serializeFolder } from "../serializers";

export async function listFolders(parentId: string | null) {
  const folders = await prisma.folder.findMany({
    where: { parentId },
    include: { _count: { select: { children: true, files: { where: { uploadStatus: "READY" } } } } },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return folders.map(serializeFolder);
}

export async function getFolder(folderId: string) {
  return prisma.folder.findFirst({
    where: { id: folderId },
    include: { _count: { select: { children: true, files: { where: { uploadStatus: "READY" } } } } },
  });
}

export async function getBreadcrumbs(folderId: string) {
  const breadcrumbs = [];
  let current = await getFolder(folderId);

  while (current) {
    breadcrumbs.unshift(serializeFolder(current));
    current = current.parentId ? await getFolder(current.parentId) : null;
  }

  return breadcrumbs;
}

export async function createFolderWithDefaults(ownerId: string, name: string, parentId: string | null) {
  return prisma.$transaction(async (tx) => {
    if (parentId) {
      const parent = await tx.folder.findFirst({ where: { id: parentId } });
      if (!parent) throw new Error("Folder not found");
    }

    const folder = await tx.folder.create({
      data: { name, parentId, ownerId },
      include: { _count: { select: { children: true, files: true } } },
    });

    if (parentId === null) {
      await tx.folder.createMany({
        data: DEFAULT_FOLDER_NAMES.map((defaultName) => ({
          name: defaultName,
          parentId: folder.id,
          ownerId,
          isDefault: true,
        })),
      });
    }

    return serializeFolder(folder);
  });
}
