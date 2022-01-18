/*
  Warnings:

  - Added the required column `points` to the `PointHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `PointHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PointHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PointHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PointHistory" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "PointHistory";
DROP TABLE "PointHistory";
ALTER TABLE "new_PointHistory" RENAME TO "PointHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
