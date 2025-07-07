# Настройка базы данных Supabase

## 🚀 Быстрая настройка

### 1. Создание проекта в Supabase

1. Зайди на [supabase.com](https://supabase.com)
2. Создай новый проект:
   - Название: `telegram-veo3-bot`
   - Регион: `Central Europe (Frankfurt)` (для лучшей скорости в России)
   - Выбери пароль для базы данных

### 2. Создание схемы базы данных

Есть два способа создать схему:

#### Способ 1: Через SQL Editor (рекомендуется)

1. Открой SQL Editor в панели Supabase
2. Скопируй содержимое файла `schema.sql` 
3. Выполни запрос (нажми Run)

#### Способ 2: Пошаговые миграции

1. Выполни миграции в порядке:
   - `001_create_users_table.sql`
   - `002_create_transactions_table.sql`
   - `003_create_video_generations_table.sql`
   - `004_setup_security_policies.sql`

### 3. Получение ключей доступа

После создания схемы:

1. Перейди в Settings → API
2. Скопируй следующие значения:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_KEY`

### 4. Настройка .env файла

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

## 📊 Структура базы данных

### Таблицы

#### `users` - Пользователи бота
- `id` - UUID, первичный ключ
- `telegram_id` - ID пользователя в Telegram
- `username` - Имя пользователя в Telegram
- `first_name` - Имя пользователя
- `credits` - Количество кредитов (по умолчанию 1)
- `total_videos_generated` - Общее количество сгенерированных видео
- `referred_by` - Ссылка на пользователя, который пригласил
- `referral_code` - Уникальный код для реферальной программы
- `created_at` - Дата создания
- `last_active` - Последняя активность

#### `transactions` - Транзакции
- `id` - UUID, первичный ключ
- `user_id` - Ссылка на пользователя
- `type` - Тип транзакции (`purchase`, `generation`, `referral`)
- `credits_change` - Изменение кредитов (+ начисление, - списание)
- `amount_rub` - Сумма в рублях (для покупок)
- `telegram_payment_id` - ID платежа из Telegram
- `description` - Описание транзакции
- `created_at` - Дата создания

#### `video_generations` - Генерации видео
- `id` - UUID, первичный ключ
- `user_id` - Ссылка на пользователя
- `prompt_original` - Оригинальный промпт
- `prompt_enhanced` - Улучшенный промпт для VEO 3
- `video_type` - Тип генерации (`fast`, `premium`)
- `credits_used` - Использованные кредиты
- `file_url` - URL сгенерированного видео
- `file_size_mb` - Размер файла в МБ
- `duration_seconds` - Длительность видео
- `status` - Статус (`processing`, `completed`, `failed`)
- `error_message` - Сообщение об ошибке
- `veo_generation_id` - ID генерации в VEO 3 API
- `created_at` - Дата создания
- `completed_at` - Дата завершения

### Безопасность

Включены политики Row Level Security (RLS):
- Сервисная роль имеет полный доступ ко всем таблицам
- Пользователи могут читать только свои данные

### Индексы

Созданы индексы для оптимизации запросов:
- По `telegram_id` для быстрого поиска пользователей
- По `user_id` для быстрого поиска транзакций и генераций
- По `created_at` для сортировки по дате
- По `status` для фильтрации генераций

## 🧪 Тестирование

После создания схемы можно проверить её:

```sql
-- Проверка созданных таблиц
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Проверка созданных индексов
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Тестовая вставка пользователя
INSERT INTO users (telegram_id, username, first_name) 
VALUES (123456789, 'testuser', 'Test User');

-- Проверка вставки
SELECT * FROM users WHERE telegram_id = 123456789;
```

## 🔄 Обновление схемы

При изменении схемы создавай новые файлы миграций:
- `005_название_изменения.sql`
- `006_следующее_изменение.sql`

## 📝 Полезные запросы

```sql
-- Статистика пользователей
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as new_users_24h,
  SUM(credits) as total_credits,
  SUM(total_videos_generated) as total_videos
FROM users;

-- Топ пользователей по генерациям
SELECT 
  first_name,
  username,
  total_videos_generated,
  credits
FROM users 
ORDER BY total_videos_generated DESC 
LIMIT 10;

-- Статистика транзакций
SELECT 
  type,
  COUNT(*) as count,
  SUM(credits_change) as total_credits_change,
  SUM(amount_rub) as total_amount_rub
FROM transactions 
GROUP BY type;
``` 