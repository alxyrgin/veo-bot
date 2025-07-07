-- Полная схема базы данных для Telegram VEO 3 Bot
-- Можно выполнить в SQL Editor панели Supabase

-- ===== СОЗДАНИЕ ТАБЛИЦ =====

-- Таблица пользователей
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

-- Таблица транзакций
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'generation', 'referral')),
  credits_change INTEGER NOT NULL, -- положительное значение для начисления, отрицательное для списания
  amount_rub DECIMAL(10,2), -- сумма в рублях для покупок
  telegram_payment_id TEXT, -- ID платежа из Telegram
  description TEXT, -- описание транзакции
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица генераций видео
CREATE TABLE video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt_original TEXT NOT NULL, -- оригинальный промпт пользователя
  prompt_enhanced TEXT NOT NULL, -- улучшенный промпт для VEO 3
  video_type TEXT NOT NULL CHECK (video_type IN ('fast', 'premium')),
  credits_used INTEGER NOT NULL,
  file_url TEXT, -- URL сгенерированного видео
  file_size_mb DECIMAL(10,2), -- размер файла в МБ
  duration_seconds INTEGER, -- длительность видео в секундах
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  error_message TEXT, -- сообщение об ошибке, если генерация не удалась
  veo_generation_id TEXT, -- ID генерации в VEO 3 API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ===== СОЗДАНИЕ ИНДЕКСОВ =====

-- Индексы для таблицы users
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Индексы для таблицы transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_telegram_payment_id ON transactions(telegram_payment_id);

-- Индексы для таблицы video_generations
CREATE INDEX idx_video_generations_user_id ON video_generations(user_id);
CREATE INDEX idx_video_generations_status ON video_generations(status);
CREATE INDEX idx_video_generations_created_at ON video_generations(created_at);
CREATE INDEX idx_video_generations_veo_id ON video_generations(veo_generation_id);

-- ===== НАСТРОЙКА БЕЗОПАСНОСТИ =====

-- Включение Row Level Security (RLS) для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Политики для таблицы transactions  
CREATE POLICY "Service role can do everything on transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Политики для таблицы video_generations
CREATE POLICY "Service role can do everything on video_generations" ON video_generations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own video_generations" ON video_generations
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ===== СОЗДАНИЕ ФУНКЦИЙ И ТРИГГЕРОВ =====

-- Функция для обновления last_active
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления last_active
CREATE TRIGGER update_users_last_active
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- ===== КОММЕНТАРИИ К ТАБЛИЦАМ =====

COMMENT ON TABLE users IS 'Таблица пользователей Telegram-бота';
COMMENT ON TABLE transactions IS 'Таблица транзакций (покупки, генерации, рефералы)';
COMMENT ON TABLE video_generations IS 'Таблица генераций видео с помощью VEO 3';

-- ===== ПРОВЕРКА СОЗДАННЫХ ОБЪЕКТОВ =====

-- Выводим информацию о созданных таблицах
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Выводим информацию о созданных индексах
SELECT 
  indexname, 
  tablename, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname; 