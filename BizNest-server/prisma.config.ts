import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // This URL is used by the Prisma CLI for migrations and introspection.
    // In Supabase, this should be your DIRECT_URL (Port 5432).
    url: env("DIRECT_URL"),
  },
});
