# Telegram VEO 3 Bot

Telegram-бот для генерации видео с помощью Google VEO 3 API.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте файл `env.example` в `.env` и заполните необходимые данные:

```bash
cp env.example .env
```

Основные переменные:
- `BOT_TOKEN` - токен вашего Telegram бота
- `SUPABASE_URL` - URL вашей базы данных Supabase
- `SUPABASE_SERVICE_KEY` - сервисный ключ Supabase

### 3. Создание базы данных
Выполните SQL-скрипты для создания таблиц в Supabase:

```sql
-- Таблица пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  credits INTEGER DEFAULT 1,
  total_videos_generated INTEGER DEFAULT 0,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- Таблица транзакций
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('purchase', 'generation', 'referral')),
  credits_change INTEGER,
  amount_rub DECIMAL(10,2),
  telegram_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица генераций видео
CREATE TABLE video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  prompt_original TEXT NOT NULL,
  prompt_enhanced TEXT NOT NULL,
  video_type TEXT CHECK (video_type IN ('fast', 'premium')),
  credits_used INTEGER,
  file_url TEXT,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Запуск бота
```bash
# Режим разработки
npm run dev

# Продакшн
npm start
```

## 📁 Структура проекта

```
bot/
├── src/
│   ├── index.js           # Главный файл бота
│   ├── handlers/          # Обработчики событий
│   │   ├── start.js       # Команда /start
│   │   ├── message.js     # Обработка сообщений
│   │   ├── callback.js    # Inline кнопки
│   │   └── payment.js     # Платежи
│   ├── database/          # Работа с базой данных
│   │   └── init.js        # Инициализация Supabase
│   └── utils/             # Утилиты
│       └── logger.js      # Логирование
├── logs/                  # Логи
├── package.json
├── env.example           # Пример переменных окружения
└── README.md
```

## 🛠 Настройка

### Telegram Bot
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и укажите в `.env`
3. Настройте платежи (если нужно)

### Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите URL и ключи
3. Создайте таблицы из SQL выше

### Google Cloud (для VEO 3)
1. Создайте проект в Google Cloud
2. Активируйте Vertex AI API
3. Создайте сервисный аккаунт
4. Скачайте JSON-ключ

## 🎯 Текущий функционал

✅ Регистрация и авторизация пользователей
✅ Система кредитов и баланса
✅ Интерфейс для ввода промптов
✅ Реферальная программа
✅ Система платежей (заготовка)

🔄 В разработке:
- Генерация видео через VEO 3
- Обработка платежей
- Админ панель

## 📝 Логи

Логи сохраняются в папке `logs/`:
- `error.log` - только ошибки
- `combined.log` - все события

## 🚀 Деплой

Для деплоя на сервер используйте PM2:

```bash
# Установите PM2
npm install -g pm2

# Запустите бота
pm2 start src/index.js --name "veo-bot"

# Автозапуск
pm2 startup
pm2 save
```

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Отправьте Pull Request

## 📞 Поддержка

Если у вас возникли вопросы, создайте Issue в репозитории. Тестовое изменение для проверки деплоя
