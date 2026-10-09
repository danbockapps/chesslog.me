CREATE TABLE `game_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_comments_game` ON `game_comments` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_comments_user` ON `game_comments` (`user_id`);