import { prisma } from "@/lib/prisma";

let ensureSchemaPromise: Promise<void> | null = null;

async function applySchemaGuards(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'PaperColor'
      ) THEN
        CREATE TYPE "PaperColor" AS ENUM ('parchment', 'rose');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(
    `ALTER TYPE "PaperColor" ADD VALUE IF NOT EXISTS 'parchment';`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TYPE "PaperColor" ADD VALUE IF NOT EXISTS 'rose';`
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "devices" (
      "id" UUID PRIMARY KEY,
      "paperColor" "PaperColor" NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "letters" (
      "id" UUID PRIMARY KEY,
      "authorDeviceId" UUID NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "isBookmarked" BOOLEAN NOT NULL DEFAULT FALSE,
      "isFinished" BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT "letters_authorDeviceId_fkey"
        FOREIGN KEY ("authorDeviceId")
        REFERENCES "devices"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "images" (
      "id" TEXT PRIMARY KEY,
      "letterId" UUID NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "images_letterId_fkey"
        FOREIGN KEY ("letterId")
        REFERENCES "letters"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "letters_authorDeviceId_idx" ON "letters" ("authorDeviceId");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "letters_updatedAt_idx" ON "letters" ("updatedAt");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "letters_isBookmarked_idx" ON "letters" ("isBookmarked");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "letters_isFinished_idx" ON "letters" ("isFinished");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "images_letterId_idx" ON "images" ("letterId");`
  );
}

export async function ensureDatabaseSchema(): Promise<void> {
  if (!ensureSchemaPromise) {
    ensureSchemaPromise = applySchemaGuards().catch((error) => {
      ensureSchemaPromise = null;
      throw error;
    });
  }

  await ensureSchemaPromise;
}
