import "dotenv/config";
<<<<<<< HEAD
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
    orm: ormConfig({
        contract: "./prisma/contract.prisma",
        db: {
            connection: process.env["DATABASE_URL"]!,
        },
    }),

    skills: {
        agents: ["claude", "cursor", "agents", "devin"],
    },
=======
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: "postgresql://postgres:Aswalila30@localhost:5432/tugas_pertemuan3",
  },
>>>>>>> feature/auth-session-cookies
});