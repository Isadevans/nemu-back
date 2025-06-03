/*
  Warnings:

  - Added the required column `utm_campaign` to the `SessionHistories` table without a default value. This is not possible if the table is not empty.
  - Made the column `utm_content` on table `SessionHistories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SessionHistories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "utm_campaign" TEXT NOT NULL,
ALTER COLUMN "sessionId" DROP DEFAULT,
ALTER COLUMN "sessionId" SET DATA TYPE TEXT,
ALTER COLUMN "utm_source" SET DATA TYPE TEXT,
ALTER COLUMN "utm_medium" SET DATA TYPE TEXT,
ALTER COLUMN "utm_content" SET NOT NULL;
