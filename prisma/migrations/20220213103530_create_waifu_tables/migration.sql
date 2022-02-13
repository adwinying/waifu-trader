-- CreateTable
CREATE TABLE "Waifu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waifu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerHistory" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "waifuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Waifu" ADD CONSTRAINT "Waifu_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerHistory" ADD CONSTRAINT "OwnerHistory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerHistory" ADD CONSTRAINT "OwnerHistory_waifuId_fkey" FOREIGN KEY ("waifuId") REFERENCES "Waifu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
