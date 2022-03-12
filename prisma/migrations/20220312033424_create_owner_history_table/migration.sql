-- CreateTable
CREATE TABLE `OwnerHistory` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `waifuId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OwnerHistory` ADD CONSTRAINT `OwnerHistory_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnerHistory` ADD CONSTRAINT `OwnerHistory_waifuId_fkey` FOREIGN KEY (`waifuId`) REFERENCES `Waifu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
