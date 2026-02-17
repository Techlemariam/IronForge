-- AddForeignKey
ALTER TABLE "TerritoryContest" ADD CONSTRAINT "TerritoryContest_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
