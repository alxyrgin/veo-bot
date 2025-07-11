# 🚀 Быстрый запуск Telegram VEO 3 Bot

## Что уже готово

✅ **Базовая структура проекта**
✅ **Telegram-бот с полным функционалом**
✅ **База данных Supabase**
✅ **Система пользователей и кредитов**
✅ **Эмуляция генерации видео**

## Шаг 1: Настройка окружения

### 1.1 Установка зависимостей
```bash
npm install
```

### 1.2 Настройка переменных окружения
```bash
cp env.example .env
```

Отредактируйте `.env` файл:
```env
# Telegram Bot Configuration
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
BOT_USERNAME=your_bot_username

# Supabase Configuration
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY

# Server Configuration
PORT=3000
NODE_ENV=development

# Bot Settings
FREE_CREDITS_NEW_USER=1
REFERRAL_BONUS=2
REFERRAL_PURCHASE_BONUS=5
```

## Шаг 2: Создание Telegram-бота

### 2.1 Создание бота через BotFather
1. Откройте Telegram
2. Найдите [@BotFather](https://t.me/BotFather)
3. Отправьте команду `/newbot`
4. Укажите имя вашего бота
5. Укажите username бота (должен заканчиваться на `bot`)
6. Скопируйте токен в переменную `BOT_TOKEN`

### 2.2 Настройка платежей (опционально)
1. Отправьте `/mybots` BotFather
2. Выберите вашего бота
3. Выберите `Payments`
4. Настройте поставщика платежей

## Шаг 3: Настройка базы данных Supabase

### 3.1 Создание проекта
1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Выберите регион (Europe для России)
4. Установите пароль для базы данных

### 3.2 Создание таблиц
1. Откройте SQL Editor в панели Supabase
2. Скопируйте и выполните содержимое файла `database/schema.sql`
3. Проверьте, что таблицы созданы успешно

### 3.3 Получение ключей
1. Перейдите в Settings → API
2. Скопируйте:
   - URL проекта → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`

## Шаг 4: Запуск и тестирование

### 4.1 Запуск в режиме разработки
```bash
npm run dev
```

### 4.2 Тестирование функций

**Команды для тестирования:**
- `/start` - Регистрация и главное меню
- `/help` - Справка
- `/balance` - Проверка баланса
- `/generate` - Быстрое создание видео

**Тестовые сценарии:**
1. **Регистрация нового пользователя**
   - Отправьте `/start`
   - Проверьте, что получили 1 бесплатный кредит

2. **Создание видео**
   - Напишите описание видео: "Красивый закат над океаном"
   - Выберите режим генерации
   - Дождитесь завершения (30 секунд)

3. **Проверка баланса**
   - Используйте `/balance`
   - Проверьте историю транзакций

4. **Голосовые сообщения**
   - Отправьте голосовое сообщение
   - Проверьте эмуляцию расшифровки

## Шаг 5: Что работает сейчас

### ✅ Рабочий функционал
- Регистрация пользователей
- Система кредитов
- Меню и навигация
- Эмуляция генерации видео
- Реферальная система (базовая)
- Обработка текстовых промптов
- Голосовые сообщения (эмуляция)
- История транзакций
- Обработка ошибок

### ⚠️ Заглушки и эмуляция
- Генерация видео (30 сек эмуляция)
- Расшифровка голосовых сообщений
- Система платежей
- VEO 3 API интеграция
- Улучшение промптов

## Шаг 6: Следующие шаги

1. **Интеграция с VEO 3 API** (задача 5)
2. **Система платежей** (задача 6)
3. **Расшифровка голосовых сообщений** (задача 7)
4. **Деплой на сервер** (задача 8)

## Полезные команды

```bash
# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start

# Просмотр логов
tail -f logs/combined.log

# Проверка структуры базы данных
cat database/schema.sql
```

## Возможные проблемы

### Проблема: Бот не отвечает
**Решение:** Проверьте токен бота в `.env` файле

### Проблема: Ошибки базы данных
**Решение:** Убедитесь, что выполнили все SQL-скрипты в Supabase

### Проблема: Polling errors
**Решение:** Убедитесь, что только один экземпляр бота запущен

## Поддержка

Если возникли проблемы:
1. Проверьте логи в папке `logs/`
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к базе данных
4. Проверьте, что бот имеет правильные права в Telegram

---

🎉 **Поздравляю! Ваш бот готов к тестированию!**

Теперь вы можете:
- Регистрировать пользователей
- Тестировать создание видео
- Проверять работу базы данных
- Изучать код и дорабатывать функции 