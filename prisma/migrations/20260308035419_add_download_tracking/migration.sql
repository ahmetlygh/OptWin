-- AlterTable
ALTER TABLE "daily_stats" ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "site_stats" ADD COLUMN     "totalDownloads" INTEGER NOT NULL DEFAULT 0;
