-- Включение Row Level Security (RLS) для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
-- Полный доступ для сервисного ключа (service_role)
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Пользователи могут читать только свои данные
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Политики для таблицы transactions  
-- Полный доступ для сервисного ключа
CREATE POLICY "Service role can do everything on transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Пользователи могут читать только свои транзакции
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Политики для таблицы video_generations
-- Полный доступ для сервисного ключа
CREATE POLICY "Service role can do everything on video_generations" ON video_generations
  FOR ALL USING (auth.role() = 'service_role');

-- Пользователи могут читать только свои генерации
CREATE POLICY "Users can read own video_generations" ON video_generations
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Создание функции для обновления last_active
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления last_active
CREATE TRIGGER update_users_last_active
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active(); 