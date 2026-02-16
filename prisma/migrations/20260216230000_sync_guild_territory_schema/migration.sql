-- AlterTable
ALTER TABLE "Guild" ADD COLUMN "gold" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Territory_name_key" ON "Territory"("name");
