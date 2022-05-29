-- CreateTable
CREATE TABLE "OwnerHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "waifuId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OwnerHistory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OwnerHistory_waifuId_fkey" FOREIGN KEY ("waifuId") REFERENCES "Waifu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
