CREATE INDEX `idx_game_tags_game` ON `game_tags` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_tags_tag` ON `game_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX `idx_games_collection_dttm` ON `games` (`collection_id`,`game_dttm`);