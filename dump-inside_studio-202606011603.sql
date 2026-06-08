-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: inside_studio
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `schedule_id` int DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'confirmed',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `schedule_id` (`schedule_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directions`
--

DROP TABLE IF EXISTS `directions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `directions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directions`
--

LOCK TABLES `directions` WRITE;
/*!40000 ALTER TABLE `directions` DISABLE KEYS */;
INSERT INTO `directions` VALUES (1,'Afro Style (12+)'),(2,'Choreo, All Styles (12+)'),(3,'Акробатика (6+)'),(4,'Breaking (6+)'),(5,'High Heels (начинающие, 18+)'),(6,'High Heels (продолжающие, 18+)'),(7,'Dancehall Female (16+)'),(8,'Hip-Hop (10–13 лет)'),(9,'Hip-Hop (14+)'),(10,'Mix Choreo (12+)'),(11,'Baby Kids (4+)'),(12,'Contemporary (16+)');
/*!40000 ALTER TABLE `directions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `type` enum('photo','video') DEFAULT 'photo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_blocks`
--

DROP TABLE IF EXISTS `home_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `block_key` varchar(50) NOT NULL,
  `name` varchar(120) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `block_key` (`block_key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_blocks`
--

LOCK TABLES `home_blocks` WRITE;
/*!40000 ALTER TABLE `home_blocks` DISABLE KEYS */;
INSERT INTO `home_blocks` VALUES (1,'banner','Баннер (видео)',1,1),(2,'about','Про нас + фото студии',2,1),(3,'reviews','Отзывы',3,1),(4,'social','Соцсети и адрес',4,1);
/*!40000 ALTER TABLE `home_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_images`
--

DROP TABLE IF EXISTS `home_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_path` varchar(255) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_images`
--

LOCK TABLES `home_images` WRITE;
/*!40000 ALTER TABLE `home_images` DISABLE KEYS */;
INSERT INTO `home_images` VALUES (1,'/images/carousel-1.jpg',1),(2,'/images/carousel-2.jpg',2),(3,'/images/carousel-3.jpg',3),(4,'/images/carousel-4.jpg',4);
/*!40000 ALTER TABLE `home_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merch_orders`
--

DROP TABLE IF EXISTS `merch_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merch_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(150) NOT NULL,
  `color` varchar(80) DEFAULT NULL,
  `size` varchar(80) DEFAULT NULL,
  `custom_name` varchar(120) DEFAULT NULL,
  `total_price` int NOT NULL DEFAULT '0',
  `status` enum('in_work','ready') NOT NULL DEFAULT 'in_work',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(30) DEFAULT 'card',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merch_orders`
--

LOCK TABLES `merch_orders` WRITE;
/*!40000 ALTER TABLE `merch_orders` DISABLE KEYS */;
INSERT INTO `merch_orders` VALUES (1,7,4,'Оверсайз лонгсливы','Черный',NULL,'фыв',2490,'ready','2026-05-29 04:38:17','card'),(2,7,4,'Оверсайз лонгсливы','Черный',NULL,'AFSADADS',2490,'ready','2026-05-29 05:01:11','card'),(3,7,4,'Оверсайз лонгсливы','Черный',NULL,NULL,1990,'in_work','2026-05-29 05:01:33','card'),(4,7,4,'Оверсайз лонгсливы','Черный',NULL,NULL,1990,'in_work','2026-05-30 08:16:17','card'),(5,7,4,'Оверсайз лонгсливы','Черный',NULL,NULL,1990,'in_work','2026-05-30 08:23:12','sbp');
/*!40000 ALTER TABLE `merch_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merch_products`
--

DROP TABLE IF EXISTS `merch_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merch_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` int NOT NULL DEFAULT '0',
  `image` varchar(255) DEFAULT NULL,
  `colors` varchar(255) DEFAULT '',
  `sizes` varchar(255) DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merch_products`
--

LOCK TABLES `merch_products` WRITE;
/*!40000 ALTER TABLE `merch_products` DISABLE KEYS */;
INSERT INTO `merch_products` VALUES (4,'Оверсайз лонгсливы','',1990,'/images/home-1780029487344-974848.jpg','Черный, Серый, Розовый','',1,'2026-05-29 04:38:07'),(6,'asd','',2222,'/images/home-1780129544264-943879.jpg','Черный, Серый, Розовый','',1,'2026-05-30 08:25:44');
/*!40000 ALTER TABLE `merch_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `subscription_id` int DEFAULT NULL,
  `sessions_left` int DEFAULT NULL,
  `purchased_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `text` text NOT NULL,
  `rating` int DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trainer_id` int DEFAULT NULL,
  `direction_id` int DEFAULT NULL,
  `day_of_week` varchar(20) DEFAULT NULL,
  `time` time DEFAULT NULL,
  `max_seats` int DEFAULT '15',
  `hall` varchar(50) NOT NULL DEFAULT '1 зал',
  `age_group` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `trainer_id` (`trainer_id`),
  KEY `direction_id` (`direction_id`),
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`),
  CONSTRAINT `schedule_ibfk_2` FOREIGN KEY (`direction_id`) REFERENCES `directions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (8,2,5,'ПН','16:30:00',15,'1 зал','');
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_content`
--

DROP TABLE IF EXISTS `site_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_content` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content_key` varchar(80) NOT NULL,
  `content_value` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_key` (`content_key`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_content`
--

LOCK TABLES `site_content` WRITE;
/*!40000 ALTER TABLE `site_content` DISABLE KEYS */;
INSERT INTO `site_content` VALUES (1,'banner_video','/videos/inside-banner.MP4'),(2,'banner_btn_guest','Начать сейчас'),(3,'banner_btn_user','Личный кабинет'),(4,'about_title','Про нас'),(5,'about_text1','Не просто место для танцев, это настоящая тусовка единомышленников, которые готовы развиваться и вдохновляться друг другом!'),(6,'about_text2','Каждый из вас может стать частью этой невероятной команды и реализовать свои творческие амбиции!'),(7,'reviews_title','Отзывы наших учеников'),(8,'social_title','Подпишись на наши соц-сети!'),(9,'social_note','*Запрещено на территории Российской Федерации'),(10,'social_instagram','https://www.instagram.com/inside.dance.ang?igsh=MWJpc2c3N2p3aGlwOQ=='),(11,'social_telegram','https://t.me/INSIDE_danceang'),(12,'social_vk','https://vk.com/insideangarsk'),(13,'address_title','Найди нас на картах'),(14,'address_name','INSIDE Dance Studio'),(15,'address_line1','г. Ангарск, ул 14 Декабря, 22'),(16,'address_line2','(За ДК \"Современник\")'),(17,'map_link','https://yandex.ru/maps/?text=%D0%90%D0%BD%D0%B3%D0%B0%D1%80%D1%81%D0%BA%20%D1%83%D0%BB%2014%20%D0%94%D0%B5%D0%BA%D0%B0%D0%B1%D1%80%D1%8F%2022'),(18,'map_link_text','Открыть в Яндекс Картах →');
/*!40000 ALTER TABLE `site_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total_classes` int DEFAULT '0',
  `duration_days` int DEFAULT '30',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,'8 занятий (с привязкой)',3500.00,8,30,1,'2026-05-24 15:56:59'),(2,'12 занятий (с привязкой)',4200.00,12,30,1,'2026-05-24 15:56:59'),(3,'8 занятий (без привязки)',3900.00,8,30,1,'2026-05-24 15:56:59'),(4,'12 занятий (без привязки)',4600.00,12,30,1,'2026-05-24 15:56:59'),(5,'25 занятий',7500.00,25,30,1,'2026-05-24 15:56:59'),(6,'Breakdance & Акробатика',5500.00,8,30,1,'2026-05-24 15:56:59'),(7,'Body Mix & Растяжка',2000.00,4,30,1,'2026-05-24 15:56:59'),(8,'Акробатика',3000.00,4,30,1,'2026-05-24 15:56:59'),(9,'Body Mix & Растяжка',3300.00,8,30,1,'2026-05-24 15:56:59'),(10,'Абонемент на 3 месяца (24 занятия)',9200.00,24,90,1,'2026-05-24 15:56:59'),(11,'Абонемент на 3 месяца (36 занятий)',11000.00,36,90,1,'2026-05-24 15:56:59'),(12,'Безлимит на месяц',9000.00,0,30,1,'2026-05-24 15:56:59'),(13,'Пробное занятие',300.00,1,1,1,'2026-05-24 15:56:59'),(14,'Два пробных занятия',450.00,2,1,1,'2026-05-24 15:56:59');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `experience` text,
  `description` text,
  `social` varchar(100) DEFAULT NULL,
  `specialties` text,
  `age_groups` varchar(255) DEFAULT NULL,
  `quote` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES (2,'Бирюков Андрей','/images/trainer-andrey.jpg','10','Опыт преподавания 5 лет, чемпион города по брейк-дансу','https://www.instagram.com/_valeria_malaya_','Breakdance, Hip-Hop','8','цитата'),(3,'Виборова Светлана','/images/trainer-svetlana.jpg',NULL,'Хореограф-постановщик, участница всероссийских конкурсов',NULL,'Contemporary, Jazz, Stretching',NULL,NULL),(5,'Савчук Ника','/images/trainer-nika.jpg',NULL,'Танцор с 10-летним стажем, работала с известными хореографами',NULL,'Contemporary, Body Mix',NULL,NULL),(6,'Луконин Сергей','/images/trainer-sergey.jpg',NULL,'Мастер спорта по акробатике, тренер с 7-летним опытом',NULL,'Breakdance, Акробатика',NULL,NULL),(7,'Малая Валерия','/images/trainer-valeriya.jpg',NULL,'Призёр всероссийских танцевальных конкурсов',NULL,'Contemporary, Stretching',NULL,NULL),(8,'Солощенко Сергей','/images/trainer-soloschenko.jpg',NULL,'Хореограф-постановщик танцевальных шоу',NULL,'High-Heels, Body Mix',NULL,NULL);
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_subscriptions`
--

DROP TABLE IF EXISTS `user_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('limit','unlimited') DEFAULT 'limit',
  `total_classes` int DEFAULT '0',
  `remaining_classes` int DEFAULT '0',
  `valid_until` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) DEFAULT 'card',
  `visits` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_subscriptions`
--

LOCK TABLES `user_subscriptions` WRITE;
/*!40000 ALTER TABLE `user_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (10,'89025149444','$2b$10$RMzcvnelDMGdCqWrvcEJduP05A2qpPFVZL0sZVgHTvSS4Tr1qTVse','Дворникова Алиса Александровна','Дворникова','Алиса','Александровна','advornikova2006@gmail.com','admin','2026-06-01 08:02:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'inside_studio'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-01 16:03:32
