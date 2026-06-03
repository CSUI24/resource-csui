-- Supabase/Postgres search helpers for `%term%` searches used by /api/search.
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS "Folder_name_trgm_idx"
ON "Folder"
USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ResourceFile_name_trgm_idx"
ON "ResourceFile"
USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ResourceFile_metadata_gin_idx"
ON "ResourceFile"
USING gin ("metadata" jsonb_path_ops);

CREATE INDEX IF NOT EXISTS "ResourceFile_metadata_description_trgm_idx"
ON "ResourceFile"
USING gin (("metadata"->>'description') gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ResourceFile_metadata_lecturer_trgm_idx"
ON "ResourceFile"
USING gin (("metadata"->>'lecturer') gin_trgm_ops);
