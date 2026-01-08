-- =========================================
-- NENÉ DATABASE MIGRATION SCRIPT
-- Run this on your live server to update the database
-- This script is SAFE - it only ADDS new structures
-- =========================================

-- 1. Create product_variations table (NEW)
CREATE TABLE IF NOT EXISTS `product_variations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_variations_product_id` (`product_id`),
  KEY `product_variations_is_available` (`is_available`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Add variation_id column to cart_items table (if not exists)
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'cart_items' 
    AND COLUMN_NAME = 'variation_id'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `cart_items` ADD COLUMN `variation_id` int DEFAULT NULL AFTER `product_id`, ADD KEY `cart_items_variation_id` (`variation_id`)', 
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add foreign key constraint for variation_id (if column was just added)
-- Note: Only run this if the column was added
-- ALTER TABLE `cart_items` 
-- ADD CONSTRAINT `cart_items_variation_fk` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Add variation_id to order_items table (if not exists)
SET @column_exists2 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'order_items' 
    AND COLUMN_NAME = 'variation_id'
);

SET @sql2 = IF(@column_exists2 = 0, 
    'ALTER TABLE `order_items` ADD COLUMN `variation_id` int DEFAULT NULL AFTER `product_id`, ADD COLUMN `variation_name` varchar(100) DEFAULT NULL AFTER `variation_id`', 
    'SELECT 1'
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 5. Update SequelizeMeta to mark migrations as run
-- (Optional - only if you want Sequelize to recognize these as run)
INSERT IGNORE INTO `SequelizeMeta` (`name`) VALUES 
('20251225000000-add-product-variations.js');

-- =========================================
-- VERIFICATION QUERIES (Run after migration)
-- =========================================
-- Check if product_variations table exists:
-- SHOW TABLES LIKE 'product_variations';
-- 
-- Check if variation_id column exists in cart_items:
-- DESCRIBE cart_items;
--
-- Check if variation columns exist in order_items:
-- DESCRIBE order_items;
-- =========================================
