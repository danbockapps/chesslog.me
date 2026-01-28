DROP INDEX `games_url_unique`;--> statement-breakpoint
DROP INDEX `games_lichess_game_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `games_collection_id_lichess_game_id_unique` ON `games` (`collection_id`,`lichess_game_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `games_collection_id_url_unique` ON `games` (`collection_id`,`url`);