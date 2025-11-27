CREATE TABLE `adminSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`upiId` varchar(255) NOT NULL,
	`upiName` varchar(255),
	`bankAccount` varchar(255),
	`phoneNumber` varchar(20),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courseDeliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`paymentRequestId` int NOT NULL,
	`userId` int NOT NULL,
	`deliveryType` enum('course','api','tool','service') NOT NULL,
	`deliveryContent` text,
	`accessLink` varchar(500),
	`apiKey` varchar(500),
	`credentials` text,
	`expiresAt` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courseDeliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','approved','rejected','delivered') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255) NOT NULL,
	`paymentMethod` varchar(50) NOT NULL DEFAULT 'upi',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentRequests_id` PRIMARY KEY(`id`)
);
