-- CreateIndex
CREATE INDEX "Folder_parentId_name_idx" ON "Folder"("parentId", "name");

-- CreateIndex
CREATE INDEX "ResourceFile_folderId_uploadStatus_name_idx" ON "ResourceFile"("folderId", "uploadStatus", "name");
