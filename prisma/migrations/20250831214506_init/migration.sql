-- CreateTable
CREATE TABLE `Recipient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `accessCodeHash` VARCHAR(191) NOT NULL,
    `eventDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Recipient_slug_key`(`slug`),
    INDEX `Recipient_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Letter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipientId` INTEGER NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `messageText` TEXT NULL,
    `imagePath` VARCHAR(512) NULL,
    `audioPath` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Letter_recipientId_createdAt_idx`(`recipientId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `Recipient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
