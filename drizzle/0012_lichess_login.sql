ALTER TABLE `users` ADD `email_verified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lichess_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `lichess_username` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_lichess_id_unique` ON `users` (`lichess_id`);