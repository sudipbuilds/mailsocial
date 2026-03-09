PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`secret_key` text,
	`username` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "image", "name", "email", "secret_key", "username", "email_verified", "created_at", "updated_at") SELECT "id", "image", "name", "email", "secret_key", "username", "email_verified", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_secretKey_idx` ON `users` (`secret_key`);--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_username` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `refunded_at` integer;--> statement-breakpoint
CREATE INDEX `orders_paymentId_idx` ON `orders` (`payment_id`);--> statement-breakpoint
CREATE INDEX `orders_customerUsername_idx` ON `orders` (`customer_username`);