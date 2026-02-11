CREATE INDEX `idx_collections_owner_id` ON `collections` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_tags_owner_id` ON `tags` (`owner_id`);