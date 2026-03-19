-- AlterTable: Add newBadge and newBadgeExpiry to features (already applied via db push)
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "newBadge" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "features" ADD COLUMN IF NOT EXISTS "newBadgeExpiry" TIMESTAMP(3);

-- CreateTable: visit_dedup (already applied via db push)
CREATE TABLE IF NOT EXISTS "visit_dedup" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "date" DATE NOT NULL,
    CONSTRAINT "visit_dedup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "visit_dedup_ipHash_date_key" ON "visit_dedup"("ipHash", "date");
