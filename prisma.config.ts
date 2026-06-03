import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  experimental: {
    externalTables: true,
  },
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    initShadowDb: "CREATE SCHEMA IF NOT EXISTS extensions;",
  },
  datasource: {
    // Supabase: use the direct/session connection for migrations and introspection.
    // Runtime app queries still use DATABASE_URL through src/lib/prisma.ts.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
