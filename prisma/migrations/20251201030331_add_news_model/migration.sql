-- CreateTable
CREATE TABLE `News` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `category` ENUM('MARKET', 'FENG_SHUI', 'LEGAL') NOT NULL,
    `summary` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `thumbnailUrl` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NULL DEFAULT 'Admin',
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `News_slug_key`(`slug`),
    INDEX `News_category_idx`(`category`),
    INDEX `News_createdAt_idx`(`createdAt`),
    INDEX `News_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
