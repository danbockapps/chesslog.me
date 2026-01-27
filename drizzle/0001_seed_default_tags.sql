-- Create system user to own default public tags
-- Using a fixed UUID for the system user
-- Password hash is for a random password (system user is not for login)
INSERT INTO `users` (`id`, `email`, `hashed_password`, `created_at`)
VALUES (
  'system-00000000-0000-0000-0000-000000000000',
  'system@chesslog.me',
  '$2b$10$rQZ9qZJxZ9qZJxZ9qZJxZOZKqZJxZ9qZJxZ9qZJxZ9qZJxZ9qZJx',
  '2025-01-01T00:00:00.000Z'
);
--> statement-breakpoint

-- Create default public tags
INSERT INTO `tags` (`name`, `description`, `owner_id`, `public`, `created_at`)
VALUES
  ('Played too slow', 'Burned too much time early in the game and got in time trouble', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Played too fast', 'Made moves impatiently or without proper consideration', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Opening theory', 'Got a bad position early due to lack of opening knowledge', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Middlegame strategy', 'Didn''t know the right strategy for my side in the middlegame', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Endgame strategy', 'Didn''t know the right strategy for my side in the endgame', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Loose pieces', 'Left a piece unprotected and regretted it', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('King safety', 'Allowed weaknesses around my king and regretted it', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Allowed tactic', 'Allowed a tactic by my opponent', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z'),
  ('Missed tactic', 'Had a win but I missed it', 'system-00000000-0000-0000-0000-000000000000', 1, '2025-01-01T00:00:00.000Z');
