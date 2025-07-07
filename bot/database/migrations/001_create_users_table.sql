-- Создание таблицы пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  credits INTEGER DEFAULT 1, -- 1 бесплатный кредит для новых пользователей
  total_videos_generated INTEGER DEFAULT 0,
  referred_by UUID REFERENCES users(id),
  referral_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Комментарии к полям
COMMENT ON TABLE users IS 'Таблица пользователей Telegram-бота';
COMMENT ON COLUMN users.telegram_id IS 'Уникальный ID пользователя в Telegram';
COMMENT ON COLUMN users.credits IS 'Количество кредитов для генерации видео';
COMMENT ON COLUMN users.referral_code IS 'Уникальный код для реферальной программы';
COMMENT ON COLUMN users.referred_by IS 'ID пользователя, который пригласил данного пользователя'; 