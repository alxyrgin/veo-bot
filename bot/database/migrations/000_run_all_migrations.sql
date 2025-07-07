-- Мастер-миграция для создания всей схемы базы данных
-- Запускает все миграции в правильном порядке

-- 1. Создание таблицы пользователей
\i 001_create_users_table.sql

-- 2. Создание таблицы транзакций
\i 002_create_transactions_table.sql

-- 3. Создание таблицы генераций видео
\i 003_create_video_generations_table.sql

-- 4. Настройка политик безопасности
\i 004_setup_security_policies.sql

-- Вставка тестовых данных для разработки (опционально)
-- \i 005_insert_test_data.sql

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