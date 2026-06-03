import { DEFAULT_FOLDER_NAMES } from "../constants";
import { prisma } from "../prisma";
import { serializeFolder } from "../serializers";

export async function listFolders(ownerId: string, parentId: string | null) {
  const folders = await prisma.folder.findMany({
    where: { ownerId, parentId },
    include: { _count: { select: { children: true, files: { where: { uploadStatus: "READY" } } } } },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return folders.map(serializeFolder);
}

export async function getFolderForOwner(ownerId: string, folderId: string) {
  return prisma.folder.findFirst({
    where: { id: folderId, ownerId },
    include: { _count: { select: { children: true, files: { where: { uploadStatus: "READY" } } } } },
  });
}

export async function getBreadcrumbs(ownerId: string, folderId: string) {
  const breadcrumbs = [];
  let current = await getFolderForOwner(ownerId, folderId);

  while (current) {
    breadcrumbs.unshift(serializeFolder(current));
    current = current.parentId ? await getFolderForOwner(ownerId, current.parentId) : null;
  }

  return breadcrumbs;
}

export async function createFolderWithDefaults(ownerId: string, name: string, parentId: string | null) {
  return prisma.$transaction(async (tx) => {
    if (parentId) {
      const parent = await tx.folder.findFirst({ where: { id: parentId, ownerId } });
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
