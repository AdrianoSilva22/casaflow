-- Login simples: silva / 050721
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

UPDATE users
SET
  username = 'silva',
  password_hash = '$2b$10$hE4H8bTlqAw9EH2Rb2K4mOeD16OotGWB3Jl4QQW2j1Fd9e4pEsPXK'
WHERE id = 'user_adriano';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
