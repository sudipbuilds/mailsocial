CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`customer_id` text NOT NULL,
	`payment_id` text NOT NULL,
	`payment_status` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`product_id` text NOT NULL,
	`invoice_url` text,
	`payment_method` text,
	`webhook_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_webhook_id_unique` ON `orders` (`webhook_id`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`received_at` integer NOT NULL,
	`processed` integer DEFAULT false NOT NULL,
	`raw` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` integer;