export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  isDefault: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}
