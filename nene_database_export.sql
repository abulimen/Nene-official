-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20231027000000-create-initial-tables.js'),('20231128000000-update-product-accent-fields.js'),('20231129000000-create-faq-table.js'),('20231130000000-create-product-images-table.js'),('20231201000000-create-customer-cart-tables.js'),('20231201000000-create-customers-table.js'),('20231201000001-create-carts-table.js'),('20231201000002-create-cart-items-table.js'),('20231202000000-add-customer-id-to-orders.js'),('20231203000000-create-customer-and-cart-tables.js'),('20241204150000-add-new-features.js'),('20241204170000-add-city-to-contact-info.js'),('20241204173000-add-phone-to-contact-messages.js'),('20241204191500-add-hero-footer-texts.js'),('20251124000000-add-is-featured-to-reviews.js'),('20251202000000-add-google-auth-to-customers.js'),('20251202100000-add-is-available-to-products.js'),('20251204121151-add-tags-to-products.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_temp_code` varchar(10) DEFAULT NULL,
  `two_factor_temp_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `admin_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'vicjukpa@gmail.com','$2b$10$xT2ND9wxVaFPV/sST953hOZqob9p7ElSN/2Se6D5UO5RqGPX4HrEe','Super Admin','2025-12-04 17:05:19',1,'2025-11-21 10:57:25','2025-12-04 17:05:19',1,NULL,NULL);
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `excerpt` text,
  `content` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `author` varchar(100) DEFAULT 'Admin',
  `is_published` tinyint(1) DEFAULT '1',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `blog_posts_is_published` (`is_published`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (2,'Why Greek Yogurt is the Ultimate Superfood','Discover the science-backed benefits of Greek yogurt, from its high protein content to its gut-friendly probiotics.','\n            <p>Greek yogurt has surged in popularity over the last decade, and for good reason. Unlike regular yogurt, Greek yogurt is strained to remove the whey, resulting in a thicker, creamier texture and a nutritional profile that stands out in the dairy aisle.</p>\n\n            <h3>A Protein Powerhouse</h3>\n            <p>One of the most significant advantages of Greek yogurt is its protein content. A typical serving contains nearly double the protein of regular yogurt. This makes it an excellent choice for athletes looking to repair muscle tissue after a workout, or for anyone wanting to feel fuller for longer. Protein plays a crucial role in regulating appetite hormones, which can help prevent mid-afternoon snacking.</p>\n\n            <h3>Gut Health and Probiotics</h3>\n            <p>Your gut microbiome influences everything from digestion to immune function. Greek yogurt is often packed with probiotics—beneficial bacteria that support a healthy gut environment. Regular consumption of probiotic-rich foods can improve digestion and may even boost your immune system.</p>\n\n            <h3>Versatility in the Kitchen</h3>\n            <p>Beyond the breakfast bowl, Greek yogurt is incredibly versatile. Its thick consistency makes it a perfect lower-calorie substitute for heavy cream, mayonnaise, or sour cream. Try using it in:</p>\n            <ul>\n                <li><strong>Marinades:</strong> The lactic acid helps tenderize meat.</li>\n                <li><strong>Sauces:</strong> Create creamy pasta sauces without the heavy cream.</li>\n                <li><strong>Baking:</strong> Use it to keep muffins and cakes moist while boosting protein.</li>\n            </ul>\n\n            <p>Incorporating Greek yogurt into your daily diet is a simple way to boost your nutrient intake without sacrificing flavor or texture.</p>\n        ','Health','image-1764857759488-402549712.jpg','Nené Nutrition Team',1,'2025-12-04 12:22:29','2025-12-04 12:22:29','2025-12-04 14:15:59'),(3,'5 Minute Breakfasts That Fuel Your Day','Mornings are busy. Here are quick, nutritious breakfast ideas using Nené products that you can whip up in minutes.','<p>We’ve all been there: the alarm goes off late, you’re already thinking about the traffic, and suddenly breakfast becomes an afterthought. However, skipping the first meal of the day often leads to energy crashes before noon and poor food choices when hunger finally hits.</p><p>The solution isn’t waking up earlier to cook a full meal; it’s smarter, faster recipes using ingredients you likely already have in your kitchen.</p><p>Here are 5 quick breakfast ideas using staples like bread, oats, and local fruits, boosted with Nené products to fuel your hustle.</p><h3><strong>1. Creamy Oats &amp; Coconut</strong> </h3><p>Most Nigerian households have a tin of oats in the cupboard. Instead of just using plain water or powdered milk, stir a generous dollop of <strong>Nené Unsweetened Greek Yogurt</strong> into your cooked oats. It makes it incredibly creamy and adds a protein punch to keep you full. Top with grated coconut or a few groundnuts for that essential crunch.</p><h3><strong>2. The \"Groundnut\" Power Smoothie</strong> </h3><p>This is perfect for when you need to rush out the door. In a blender, combine half a cup of <strong>Nené Greek yogurt</strong>, one ripe banana (the sweeter the better!), a hefty tablespoon of peanut butter (groundnut paste), and a splash of water or liquid milk to get things moving. It’s rich in potassium and healthy fats—a perfect fuel for the day ahead.</p><h3><strong>3. Creamy \"Pear\" and Bread</strong> </h3><p>Bread and pear (avocado) is a Nigerian breakfast staple. Let\'s upgrade it. Instead of just slicing the avocado on the bread, mash half a ripe avocado in a small bowl and stir in a tablespoon of <strong>Nené Unsweetened Greek Yogurt</strong>. The yogurt makes the avocado incredibly creamy, adds a nice tangy flavor, and boosts the protein. Spread thickly on your usual sliced bread or toast and finish with a pinch of salt and black pepper. It’s a power breakfast in 3 minutes.</p><h3><strong>4. The Tropical Fruit Bowl</strong> </h3><p>We are blessed with amazing fruits here. Chop up whatever is in season—sweet pineapple, pawpaw, or watermelon. Toss them in a bowl and dress them with a few spoonfuls of <strong>Nené yogurt</strong> and a drizzle of honey. It takes two minutes to prepare and tastes like sunshine.</p><h3><strong>5. Creamy Garri Soak (The Modern Twist)</strong></h3><p>Yes, Garri for breakfast! It’s quick, cheap, and filling. Prepare your soaking Garri as usual with cold water. Instead of using expensive tinned milk, mix in <strong>Nené Sweetened Greek Yogurt</strong>. It makes the Garri thicker, creamier, and adds the sweetness you need without extra sugar. Add your roasted groundnuts and you are good to go.</p><p>Healthy eating doesn\'t require hours in the kitchen or imported ingredients. With these simple, locally-inspired ideas, you can fuel your body effectively, even on your busiest mornings.</p>','Recipes','image-1764860148067-488798135.jpg','Nené Kitchen',1,'2025-12-03 12:22:29','2025-12-04 12:22:29','2025-12-04 14:55:48'),(4,'Sweet Tooth? How to Indulge Without the Guilt','Craving something sweet? Learn how to satisfy your dessert cravings while staying on track with your health goals.','<p>The concept of \"guilt-free\" eating often feels like a marketing gimmick. However, the goal isn\'t to eliminate sugar entirely but to find a balance that allows for enjoyment without compromising your health. Deprivation often leads to bingeing, so allowing yourself smart indulgences is actually a sustainable strategy.</p><h3>The Role of Natural Sweeteners</h3><p>Refined sugar causes rapid spikes in blood glucose, followed by crashes that leave you tired and craving more. Natural sweeteners like honey, maple syrup, or fruit purees offer a different experience. While they still contain sugar, they often come with trace minerals and antioxidants. More importantly, when paired with protein and fat—like in our Sweetened Greek Yogurt—the absorption of sugar is slowed, resulting in more stable energy levels.</p><h3>Smart Swaps</h3><p>Satisfying a craving is often about texture and flavor rather than just sugar.</p><ul><li><p><strong>Craving Ice Cream?</strong> Try our Greek Yogurts. They offers the same creamy, cold satisfaction but with live cultures and protein.</p></li><li><p><strong>Craving Cake?</strong> A yogurt parfait with layers of fruit and granola can mimic the complexity of a dessert while providing fiber and vitamins.</p></li><li><p><strong>Craving Chocolate?</strong> Dark chocolate (70% cocoa or higher) contains less sugar and is rich in iron and magnesium. Pair a square with a dollop of yogurt for a balanced treat.</p></li></ul><h3>Mindful Indulgence</h3><p>Often, we eat sweets out of boredom or stress rather than genuine hunger. Taking the time to sit down and truly savor a treat can make a small portion feel much more satisfying. Notice the texture, the temperature, and the flavor profile. When you eat mindfully, you\'re less likely to overindulge.</p><p>Wellness is a marathon, not a sprint. Incorporating treats that offer nutritional value allows you to enjoy the sweeter side of life while maintaining your overall well-being.</p>','Lifestyle','image-1764857978631-909710968.jpg','Nené Wellness',1,'2025-12-02 12:22:29','2025-12-04 12:22:29','2025-12-04 14:21:43');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cart_items_cart_id` (`cart_id`),
  KEY `cart_items_product_id` (`product_id`),
  KEY `idx_cart_items_cart_product` (`cart_id`,`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (15,2,6,12,'2025-12-04 15:49:22','2025-12-04 17:08:19'),(20,1,6,1,'2025-12-04 19:14:09','2025-12-04 19:14:09'),(21,1,7,1,'2025-12-04 19:14:11','2025-12-04 19:14:11');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_id` (`customer_id`),
  UNIQUE KEY `carts_customer_id_unique` (`customer_id`),
  UNIQUE KEY `idx_carts_customer` (`customer_id`),
  KEY `carts_customer_id` (`customer_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,1,'2025-11-23 14:43:03','2025-11-23 14:43:03'),(2,2,'2025-12-02 09:24:15','2025-12-02 09:24:15'),(3,3,'2025-12-02 09:32:46','2025-12-02 09:32:46');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_info`
--

DROP TABLE IF EXISTS `contact_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `business_hours` varchar(200) DEFAULT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `city` varchar(100) DEFAULT 'Lagos, Nigeria',
  `hero_title` varchar(200) DEFAULT 'Handcrafted with Love',
  `hero_subtitle` text,
  `footer_tagline` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_info`
--

LOCK TABLES `contact_info` WRITE;
/*!40000 ALTER TABLE `contact_info` DISABLE KEYS */;
INSERT INTO `contact_info` VALUES (1,'+234 800 123 4568','vicjukpa@gmail.com','123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria','Mon-Fri 9am to 5pm',NULL,'2025-12-04 16:39:40','2025-12-04 19:31:36','Abeokuta, Nigeria','Handcrafted with Love','Experience the richness of authentic artisanal dairy. From creamy Greek yogurt to decadent parfaits and treats.','Experience the richness of authentic artisanal dairy. From creamy Greek yogurt to decadent parfaits and treats.');
/*!40000 ALTER TABLE `contact_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `replied_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Jonathan Samuel','xpansieve@gmail.com','Quick Message','I\'m just testing! ;)',1,NULL,'2025-12-04 17:29:02','2025-12-04 18:54:07',NULL),(2,'Samuel Abulimen','abulimensamuel2@gmail.com','Quick Message','hiiiiiii ;)))',1,NULL,'2025-12-04 18:03:55','2025-12-04 18:54:11','07062708102'),(3,'Samuel Abulimen','abulimensamuel2@gmail.com','Quick Message','hola!!!!1',1,NULL,'2025-12-04 18:43:27','2025-12-04 18:49:02','07062708102');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `google_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `customers_email_unique` (`email`),
  UNIQUE KEY `idx_customers_email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `customers_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'abulimensamuel2@gmail.com','$2b$10$5h29BZl1JLsmO6L92bqPG.hyoVsT8wn4I6.CRtJblGQ9WVICIjpQC','Samuel','Abulimen','07062708102',1,'2025-11-23 14:43:03','2025-11-23 14:43:03',NULL),(2,'wrightmatthew907@gmail.com',NULL,'Matthew','Wright',NULL,1,'2025-12-02 09:24:15','2025-12-02 09:24:15','105083727899012085495'),(3,'vicjukpa@gmail.com',NULL,'Victor Chimankpa','Ajuruwa',NULL,1,'2025-12-02 09:32:46','2025-12-02 09:32:46','115138264035048207644');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_codes`
--

DROP TABLE IF EXISTS `discount_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) DEFAULT '0.00',
  `usage_limit` int DEFAULT NULL,
  `usage_count` int DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_codes`
--

LOCK TABLES `discount_codes` WRITE;
/*!40000 ALTER TABLE `discount_codes` DISABLE KEYS */;
INSERT INTO `discount_codes` VALUES (1,'THANKSGIVING25','percentage',20.00,0.00,NULL,0,'2025-12-06 00:00:00',0,'2025-11-30 11:05:10','2025-11-30 11:05:20'),(8,'THANKSGIVIN25','percentage',25.00,0.00,NULL,0,'2025-12-04 00:00:00',1,'2025-11-30 11:17:57','2025-11-30 11:17:57'),(9,'THANKSGIVIN255','percentage',50.00,0.00,NULL,0,'2025-12-05 00:00:00',1,'2025-12-04 15:52:11','2025-12-04 15:52:11');
/*!40000 ALTER TABLE `discount_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `faqs_is_active_display_order` (`is_active`,`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,'How long does Nené Greek Yogurt last?','The expiry date is printed on each product cup to guarantee that you enjoy the freshest-tasting yogurt every time.',NULL,1,1,'2025-11-22 07:44:22','2025-11-22 07:44:22');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Nené Unsweetened Greek Yogurt',4800.00,22,105600.00,'2025-11-23 17:16:21','2025-11-23 17:16:21'),(2,2,1,'Nené Unsweetened Greek Yogurt',4800.00,1,4800.00,'2025-11-23 18:38:37','2025-11-23 18:38:37'),(3,3,1,'Nené Unsweetened Greek Yogurt',4800.00,5,24000.00,'2025-11-23 18:39:57','2025-11-23 18:39:57'),(4,4,1,'Nené Unsweetened Greek Yogurt',4800.00,1,4800.00,'2025-11-23 23:14:00','2025-11-23 23:14:00'),(5,5,1,'Nené Unsweetened Greek Yogurt',4800.00,1,4800.00,'2025-11-27 01:37:14','2025-11-27 01:37:14'),(6,6,1,'Nené Unsweetened Greek Yogurt',4800.00,2,9600.00,'2025-11-27 02:03:31','2025-11-27 02:03:31'),(7,7,1,'Nené Unsweetened Greek Yogurt',4800.00,3,14400.00,'2025-11-27 17:06:54','2025-11-27 17:06:54'),(8,8,1,'Nené Unsweetened Greek Yogurt',4800.00,3,14400.00,'2025-11-27 17:13:17','2025-11-27 17:13:17'),(9,9,1,'Nené Unsweetened Greek Yogurt',4800.00,6,28800.00,'2025-11-27 19:48:14','2025-11-27 19:48:14'),(10,10,1,'Nené Unsweetened Greek Yogurt',4800.00,5,24000.00,'2025-11-27 19:55:59','2025-11-27 19:55:59'),(11,11,1,'Nené Unsweetened Greek Yogurt',4800.00,5,24000.00,'2025-11-30 09:43:12','2025-11-30 09:43:12'),(14,14,6,'Nené Ice Cream',3000.00,5,15000.00,'2025-12-04 16:00:06','2025-12-04 16:00:06'),(15,15,6,'Nené Ice Cream',3000.00,1,3000.00,'2025-12-04 18:48:20','2025-12-04 18:48:20'),(16,15,7,'Nené Chicken Shawarma',5000.00,1,5000.00,'2025-12-04 18:48:20','2025-12-04 18:48:20'),(17,15,3,'Nené Sweetened Greek Yogurt',2500.00,1,2500.00,'2025-12-04 18:48:20','2025-12-04 18:48:20'),(18,15,4,'Nené Yogurt Parfait',3500.00,1,3500.00,'2025-12-04 18:48:20','2025-12-04 18:48:20');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_by` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,NULL,'pending',NULL,'Order created','2025-11-23 17:16:21'),(2,1,'pending','cancelled',1,'Status updated to cancelled','2025-11-23 17:22:49'),(3,1,'cancelled','processing',1,'Status updated to processing','2025-11-23 17:24:22'),(4,1,'processing','pending',1,'Status updated to pending','2025-11-23 17:24:24'),(5,1,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 18:34:23'),(6,1,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 18:34:23'),(7,2,NULL,'pending',NULL,'Order created','2025-11-23 18:38:37'),(8,2,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 18:38:47'),(9,2,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 18:38:47'),(10,3,NULL,'pending',NULL,'Order created','2025-11-23 18:39:57'),(15,3,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 18:50:29'),(16,3,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 18:50:29'),(17,4,NULL,'pending',NULL,'Order created','2025-11-23 23:14:00'),(18,4,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 23:14:10'),(19,4,'pending','processing',NULL,'Payment verified and confirmed','2025-11-23 23:14:11'),(20,1,'processing','shipped',1,'Status updated to shipped','2025-11-23 23:41:17'),(21,1,'shipped','delivered',1,'Status updated to delivered','2025-11-24 00:14:46'),(22,5,NULL,'pending',NULL,'Order created','2025-11-27 01:37:14'),(23,6,NULL,'pending',NULL,'Order created','2025-11-27 02:03:31'),(24,5,'cancelled','cancelled',NULL,'Order cancelled by customer','2025-11-27 11:49:07'),(25,7,NULL,'pending',NULL,'Order created','2025-11-27 17:06:54'),(26,8,NULL,'pending',NULL,'Order created','2025-11-27 17:13:17'),(27,9,NULL,'pending',NULL,'Order created','2025-11-27 19:48:14'),(28,10,NULL,'pending',NULL,'Order created','2025-11-27 19:55:59'),(29,9,'cancelled','cancelled',NULL,'Order cancelled by customer','2025-11-27 19:58:08'),(30,8,'cancelled','cancelled',NULL,'Order cancelled by customer','2025-11-27 19:58:13'),(31,6,'cancelled','cancelled',NULL,'Order cancelled by customer','2025-11-27 19:58:17'),(32,7,'cancelled','cancelled',NULL,'Order cancelled by customer','2025-11-27 19:58:22'),(33,2,'processing','shipped',1,'Status updated to shipped','2025-11-27 20:23:05'),(34,11,NULL,'pending',NULL,'Order created','2025-11-30 09:43:12'),(35,11,'pending','processing',NULL,'Payment verified and confirmed','2025-11-30 09:46:42'),(36,11,'pending','processing',NULL,'Payment verified and confirmed','2025-11-30 09:46:42'),(39,14,NULL,'pending',NULL,'Order created','2025-12-04 16:00:06'),(40,15,NULL,'pending',NULL,'Order created','2025-12-04 18:48:20'),(41,15,'pending','processing',NULL,'Payment verified and confirmed','2025-12-04 18:48:39'),(42,15,'pending','processing',NULL,'Payment verified and confirmed','2025-12-04 18:48:39'),(43,15,'processing','shipped',1,'Status updated to shipped ','2025-12-04 19:14:31'),(44,10,'cancelled','cancelled',NULL,'Order cancelled by customer','2025-12-04 19:33:06'),(45,15,'shipped','delivered',1,'Status updated to delivered ','2025-12-04 22:06:19'),(46,15,'delivered','shipped',1,'Status updated to shipped ','2025-12-04 22:07:00');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_first_name` varchar(100) NOT NULL,
  `customer_last_name` varchar(100) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_state` varchar(100) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_reference` varchar(255) DEFAULT NULL,
  `order_status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `discount_code_id` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `customer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `discount_code_id` (`discount_code_id`),
  KEY `orders_order_number` (`order_number`),
  KEY `orders_customer_email` (`customer_email`),
  KEY `orders_order_status` (`order_status`),
  KEY `orders_customer_id` (`customer_id`),
  CONSTRAINT `orders_customer_id_foreign_idx` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`discount_code_id`) REFERENCES `discount_codes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-1763918181926-592','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',105600.00,1500.00,0.00,107100.00,'paid','rscqwueznz','delivered',NULL,NULL,'2025-11-23 17:16:21','2025-11-24 00:14:46',1),(2,'ORD-1763923117420-18','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',4800.00,1500.00,0.00,6300.00,'paid','eftfr6pojx','shipped',NULL,NULL,'2025-11-23 18:38:37','2025-11-27 20:23:05',1),(3,'ORD-1763923197083-653','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',24000.00,1500.00,0.00,25500.00,'paid','hhbztu7gcr','processing',NULL,NULL,'2025-11-23 18:39:57','2025-11-23 18:50:29',1),(4,'ORD-1763939640787-44','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',4800.00,1500.00,0.00,6300.00,'paid','1u81rxup31','processing',NULL,NULL,'2025-11-23 23:14:00','2025-11-23 23:14:11',1),(5,'ORD-1764207434285-978','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',4800.00,1500.00,0.00,6300.00,'pending','6nv9km3qjm','cancelled',NULL,NULL,'2025-11-27 01:37:14','2025-11-27 11:49:07',1),(6,'ORD-1764209011507-895','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',9600.00,1500.00,0.00,11100.00,'pending','099xbef51v','cancelled',NULL,NULL,'2025-11-27 02:03:31','2025-11-27 19:58:17',1),(7,'ORD-1764263214361-978','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',14400.00,1500.00,0.00,15900.00,'pending','lb86pse55l','cancelled',NULL,NULL,'2025-11-27 17:06:54','2025-11-27 19:58:22',1),(8,'ORD-1764263597372-571','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',14400.00,1500.00,0.00,15900.00,'pending','a6roi4p6h0','cancelled',NULL,NULL,'2025-11-27 17:13:17','2025-11-27 19:58:13',1),(9,'ORD-1764272894166-179','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',28800.00,1500.00,0.00,30300.00,'pending','sgz7ugq805','cancelled',NULL,NULL,'2025-11-27 19:48:14','2025-11-27 19:58:08',1),(10,'ORD-1764273359475-877','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',24000.00,1500.00,0.00,25500.00,'pending','u2qna40e12','cancelled',NULL,NULL,'2025-11-27 19:55:59','2025-12-04 19:33:06',1),(11,'ORD-1764495792805-234','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',24000.00,1500.00,0.00,25500.00,'paid','lyik3h2ir7','processing',NULL,NULL,'2025-11-30 09:43:12','2025-11-30 09:46:42',1),(14,'ORD-1764864006262-477','Matthew','Wright','wrightmatthew907@gmail.com','07062708102','56 Akerele St. Surulere','Lagos','Lagos',15000.00,1500.00,7500.00,9000.00,'pending','zuuubnxnh6','pending',9,NULL,'2025-12-04 16:00:06','2025-12-04 16:00:11',2),(15,'ORD-1764874100600-149','Samuel','Abulimen','abulimensamuel2@gmail.com','07062708102','B33, WINSLOW HALL, BABCOCK UNIVERSITY','ILISHAN-REMO','Ogun',14000.00,2000.00,0.00,16000.00,'paid','ctoalo9zir','shipped',NULL,NULL,'2025-12-04 18:48:20','2025-12-04 22:07:00',1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (9,2,'products/unsweetened-yogurt.jpg',1,0,'2025-12-03 17:49:08','2025-12-03 17:49:08'),(11,4,'products/yogurt-parfait.jpg',1,0,'2025-12-03 17:49:08','2025-12-03 17:49:08'),(12,5,'products/chocolate-red-velvet-parfait.jpg',1,0,'2025-12-03 17:49:08','2025-12-03 17:49:08'),(13,6,'products/ice-cream.jpg',1,0,'2025-12-03 17:49:08','2025-12-03 17:49:08'),(15,3,'/uploads/image-1764849020306-472468849.jpg',0,1,'2025-12-04 11:50:20','2025-12-04 11:50:20'),(16,7,'/uploads/image-1764850066160-393305815.jpg',0,1,'2025-12-04 12:07:46','2025-12-04 12:07:46');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `size` varchar(255) DEFAULT NULL,
  `ingredients` text,
  `nutrition_info` json DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `accent_color` varchar(50) DEFAULT NULL,
  `accent_bg_color` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `tags` varchar(500) DEFAULT NULL COMMENT 'Comma-separated product tags',
  PRIMARY KEY (`id`),
  KEY `products_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (2,'Nené Unsweetened Greek Yogurt','0g Added Sugar','Premium Greek yogurt with no added sugar. Rich, creamy, and packed with protein. Perfect for health-conscious individuals and those looking for a versatile, nutritious base for meals and snacks.',2500.00,'330 ml','- Skimmed Milk\n- Live Cultures','{\"cal\": \"176\", \"fat\": \"0\", \"carbs\": \"7.3\", \"protein\": \"44g\"}','image-1764847814630-171362058.jpg',NULL,'bg-stone-100',1,'2025-12-03 17:49:08','2025-12-04 12:13:43',1,'Greek Yogurt, Protein'),(3,'Nené Sweetened Greek Yogurt','Sweetened with Natural Sugars','Deliciously creamy Greek yogurt with a touch of natural sweetness. High in protein and probiotics, perfect for breakfast or as a healthy snack any time of day.',2500.00,'330ml','- Skimmed Milk\n- Live Cultures\n- Natural Sweetener','{\"cal\": \"190.7\", \"fat\": \"\", \"carbs\": \"3.3\", \"protein\": \"44\"}','image-1764849023516-91772946.jpg',NULL,'bg-stone-100',1,'2025-12-03 17:49:08','2025-12-04 12:13:43',1,'Greek Yogurt, Sweet'),(4,'Nené Yogurt Parfait','Real Fruit & Granola','Layers of creamy Greek yogurt, fresh fruits, and crunchy granola. A perfectly balanced and nutritious treat that delights your taste buds while fueling your body.',3500.00,'330ml','- SKimmed Milk\n- LIve Cultures\n- Granola \n- Mixed Berries','{\"cal\": \"176\", \"fat\": \"\", \"carbs\": \"7.3\", \"protein\": \"44\"}','image-1764849157919-358998800.jpg',NULL,'bg-stone-100',1,'2025-12-03 17:49:08','2025-12-04 12:13:43',1,'Parfait, Breakfast'),(5,'Nené Chocolate & Red Velvet Parfait','Real Cake & Fruits','An indulgent fusion of rich chocolate and velvety red velvet layers. A decadent dessert that is surprisingly nutritious.',4000.00,'330g','- Creamy Greek Yogurt (Pasteurized Milk, Live Cultures)\n- Red Velvet Cake Chunks (Flour, Cocoa Powder, Buttermilk, Vanilla, Red Food Color)\n- Rich Chocolate Cake Pieces (Flour, Cocoa Powder, Dark Chocolate)\n- Fresh Strawberries\n- Dark Chocolate Shavings\n- Natural Sweetener','{\"cal\": \"480\", \"fat\": \"16\", \"carbs\": \"60\", \"protein\": \"22\"}','image-1764849589072-903559765.jpg',NULL,'bg-stone-100',1,'2025-12-03 17:49:08','2025-12-04 12:13:43',1,'Parfait, Dessert'),(6,'Nené Ice Cream','Authentic Vanilla Flavour','The perfect frozen treat! Creamy, delicious ice cream, and absolutely delightful. Indulge in a taste sensation that combines rich flavors and smooth textures, making every bite a memorable experience. It\'s the ideal choice for satisfying your sweet cravings and enjoying a moment of pure happiness.',3000.00,'330ml','- Milk\n- Cream\n-Sugar\n- Stabilizers','{\"cal\": \"410\", \"fat\": \"21.8\", \"carbs\": \"47\", \"protein\": \"7\"}','image-1764847719567-642094764.jpg',NULL,'bg-stone-100',1,'2025-12-03 17:49:08','2025-12-04 12:15:33',1,'Ice Cream'),(7,'Nené Chicken Shawarma','','Tender, marinated chicken shawarma served with our signature yogurt-based sauce. A protein-packed, flavorful meal that combines Middle Eastern cuisine with the health benefits of Greek yogurt.',5000.00,'350g','- Soft Flatbread\n- Marinated Grilled Chicken\n- Sausage\n- Fresh Cabbage\n- Sweet Carrots\n- Cucumber Slices\n- Onions','{\"cal\": \"550\", \"fat\": \"15\", \"carbs\": \"52\", \"protein\": \"28\"}','image-1764850070201-232218572.jpg',NULL,'bg-stone-100',1,'2025-12-03 17:49:08','2025-12-04 12:13:43',1,'Savory, Protein');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `rating` int NOT NULL,
  `review_text` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `reviews_product_id` (`product_id`),
  KEY `reviews_status` (`status`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (18,2,'Chioma Okonkwo','chioma.okonkwo9@example.com',3,'It\'s okay, but I prefer the sweetened version more.','approved','2025-12-04 13:04:36','2025-12-04 13:04:36',0),(28,4,'Kemi Adeyemi','kemi.adeyemi79@example.com',5,'Customer service was top notch. They called to confirm my location immediately.','approved','2025-12-04 13:04:37','2025-12-04 13:11:00',1),(38,6,'Folake Mensah','folake.mensah89@example.com',5,'Perfect for this Lagos heat! So refreshing.','approved','2025-12-04 13:04:37','2025-12-04 13:08:19',1),(39,3,'Ngozi Eze','ngozi.eze3@example.com',5,'The texture is thick and creamy, just how I like it.','approved','2025-12-04 13:04:37','2025-12-04 13:04:37',1),(43,7,'Chioma Okonkwo','chioma.okonkwo2@example.com',5,'My kids finished everything in one sitting. I have to order more now.','approved','2025-12-04 13:04:37','2025-12-04 13:08:13',1);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_config`
--

DROP TABLE IF EXISTS `shipping_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state_name` varchar(100) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `state_name` (`state_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_config`
--

LOCK TABLES `shipping_config` WRITE;
/*!40000 ALTER TABLE `shipping_config` DISABLE KEYS */;
INSERT INTO `shipping_config` VALUES (1,'Lagos',1500.00,1,'2025-11-21 10:57:25','2025-11-21 10:57:25'),(2,'Abuja (FCT)',2500.00,1,'2025-11-21 10:57:25','2025-11-21 10:57:25'),(4,'Ogun',2000.00,1,'2025-11-21 10:57:25','2025-11-21 10:57:25'),(5,'Oyo',2000.00,1,'2025-11-21 10:57:25','2025-11-21 10:57:25');
/*!40000 ALTER TABLE `shipping_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_media_links`
--

DROP TABLE IF EXISTS `social_media_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_media_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform` varchar(50) NOT NULL,
  `url` varchar(500) NOT NULL,
  `icon_name` varchar(50) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_media_links`
--

LOCK TABLES `social_media_links` WRITE;
/*!40000 ALTER TABLE `social_media_links` DISABLE KEYS */;
INSERT INTO `social_media_links` VALUES (1,'Instagram','https://google.com',NULL,0,1,'2025-12-04 15:31:18','2025-12-04 15:31:18'),(2,'Twitter','https://google.com',NULL,0,1,'2025-12-04 15:31:41','2025-12-04 15:31:41');
/*!40000 ALTER TABLE `social_media_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telegram_config`
--

DROP TABLE IF EXISTS `telegram_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telegram_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bot_token` varchar(100) DEFAULT NULL,
  `chat_id` varchar(50) DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT '0',
  `notify_on_purchase` tinyint(1) DEFAULT '1',
  `notify_on_review` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telegram_config`
--

LOCK TABLES `telegram_config` WRITE;
/*!40000 ALTER TABLE `telegram_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `telegram_config` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 22:41:45
