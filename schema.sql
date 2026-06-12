-- NSBM Creators Hub - Database Schema & Data Seeding
-- Saved at /d:/Project/Web/code/schema.sql

CREATE DATABASE IF NOT EXISTS `nsbm_ministore` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `nsbm_ministore`;

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Admin credentials (username: admin, password: admin)
-- Hashed using password_hash('admin', PASSWORD_DEFAULT)
INSERT INTO `admin_users` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2y$10$eXEBoFiMI.HUnd3BCTZljeCOKcneQJNxpVG7xla9V4hSiUPxMfC42')
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL,
    `status` ENUM('Available', 'Out of Stock') DEFAULT 'Available',
    `description` TEXT,
    `image` MEDIUMTEXT NOT NULL,
    `date_added` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Products
INSERT INTO `products` (`id`, `name`, `price`, `category`, `quantity`, `status`, `description`, `image`, `date_added`) VALUES
(1, 'NSBM Official Hoodie', 4500.00, 'Apparel', 45, 'Available', 'Premium official NSBM hooded sweatshirt in heritage green. Features embroidered logo, front kangaroo pocket, and adjustable drawstrings. Perfect for campus weather.', 'img/hoodie.jpg', '2024-10-24'),
(2, 'NSBM Sticker Pack', 450.00, 'Stationery', 150, 'Available', 'A vibrant collection of custom-designed, die-cut vinyl stickers featuring university motifs, laptops, and quirky illustrations. Perfect for personalizing notebooks or laptops.', 'img/stickers.jpg', '2024-10-24'),
(3, 'Handmade Key Tag', 300.00, 'Handmade Crafts', 80, 'Available', 'Beautifully customized handmade leather and metal key tags. Engraved with intricate details, crafted by design students using durable materials.', 'img/keytag.jpg', '2024-10-23'),
(4, 'Campus Notebook', 650.00, 'Stationery', 100, 'Available', 'Sleek, minimalist campus ruled notebook with subtle green accent on the spine. 200 pages of premium quality white paper.', 'img/notebook.jpg', '2024-10-22'),
(5, 'Artisan Ceramic Mug', 1200.00, 'Handmade Crafts', 12, 'Available', 'Unique hand-thrown ceramic mug perfect for your morning coffee. Individually crafted in natural clay tones by local student artisans.', 'img/mug.jpg', '2024-10-22'),
(6, 'Campus Future Print', 800.00, 'Digital Art', 200, 'Available', 'High-resolution digital art print depicting a futuristic NSBM campus in the year 2050. Printed on high-grade matte poster card.', 'img/print.jpg', '2024-10-21'),
(7, 'Choco-Chip Cookies', 450.00, 'Baked Goods', 25, 'Available', 'Box of 6 freshly baked, gooey chocolate chip cookies. Baked daily by student bakers using premium chocolate.', 'img/cookies.jpg', '2024-10-21'),
(8, 'Faculty T-Shirt (Green)', 1200.00, 'Apparel', 60, 'Available', 'Comfortable organic cotton t-shirt in faculty green. Features subtle NSBM typography on front.', 'img/tshirt.jpg', '2024-10-20')
ON DUPLICATE KEY UPDATE 
`name` = VALUES(`name`), `price` = VALUES(`price`), `category` = VALUES(`category`), `quantity` = VALUES(`quantity`), `status` = VALUES(`status`), `description` = VALUES(`description`), `image` = VALUES(`image`), `date_added` = VALUES(`date_added`);

-- 3. Purchase Requests Table
CREATE TABLE IF NOT EXISTS `purchase_requests` (
    `id` VARCHAR(15) PRIMARY KEY,
    `customer_name` VARCHAR(100) NOT NULL,
    `nsbm_id` VARCHAR(20) NOT NULL,
    `student_batch` VARCHAR(50) NULL COMMENT 'NSBM intake/batch from registry',
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `payment_method` ENUM('cash', 'bank') NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Completed', 'Cancelled') DEFAULT 'Pending',
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Purchase Requests
INSERT INTO `purchase_requests` (`id`, `customer_name`, `nsbm_id`, `email`, `phone`, `payment_method`, `total`, `status`, `date`) VALUES
('REQ-9081', 'Kasun Perera', '1002934', 'kasun@student.nsbm.ac.lk', '0771234567', 'cash', 2400.00, 'Pending', '2024-10-24 09:41:00'),
('REQ-9080', 'Amali Silva', '1003482', 'amali@student.nsbm.ac.lk', '0717654321', 'bank', 650.00, 'Approved', '2024-10-24 08:30:00'),
('REQ-9079', 'Dinuka Fernando', '1001122', 'dinuka@student.nsbm.ac.lk', '0723456789', 'bank', 3600.00, 'Completed', '2024-10-23 16:15:00'),
('REQ-9078', 'Sarah Jane', '1004551', 'sarah@student.nsbm.ac.lk', '0759876543', 'cash', 4500.00, 'Cancelled', '2024-10-23 14:10:00')
ON DUPLICATE KEY UPDATE 
`customer_name` = VALUES(`customer_name`), `nsbm_id` = VALUES(`nsbm_id`), `email` = VALUES(`email`), `phone` = VALUES(`phone`), `payment_method` = VALUES(`payment_method`), `total` = VALUES(`total`), `status` = VALUES(`status`), `date` = VALUES(`date`);

-- 4. Request Items Table (Maps requests to products for cart items)
CREATE TABLE IF NOT EXISTS `request_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `request_id` VARCHAR(15) NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`request_id`) REFERENCES `purchase_requests`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Request Items corresponding to seeded requests
INSERT INTO `request_items` (`request_id`, `product_id`, `quantity`, `price`) VALUES
('REQ-9081', 8, 2, 1200.00),
('REQ-9080', 4, 1, 650.00),
('REQ-9079', 5, 3, 1200.00),
('REQ-9078', 1, 1, 4500.00);
