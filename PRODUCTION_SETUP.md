# Настройка продакшн окружения

## Настройка .env файла на сервере

Создайте файл `/home/veo-bot/bot/.env` со следующим содержимым:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Supabase Configuration  
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Cloud Configuration (for VEO 3 API)
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_LOCATION=us-central1

# OpenRouter Configuration (alternative AI provider)
OPENROUTER_API_KEY=your_openrouter_api_key

# Environment
NODE_ENV=production

# Logging
LOG_LEVEL=info

# Server Configuration
PORT=3000
```

## Шаги для получения ключей:

### 1. Telegram Bot Token
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте токен из ответа

### 2. Supabase
1. Зайдите на https://supabase.com
2. Создайте новый проект
3. В настройках проекта найдите:
   - `SUPABASE_URL` - Project URL
   - `SUPABASE_ANON_KEY` - Project API Keys → anon/public

### 3. Google Cloud (для VEO 3 API)
1. Зайдите в Google Cloud Console
2. Создайте проект или выберите существующий
3. Включите Vertex AI API
4. Настройте аутентификацию (service account key)

### 4. OpenRouter (альтернатива)
1. Зайдите на https://openrouter.ai
2. Зарегистрируйтесь и получите API ключ

## Настройка GitHub Secrets

Перейдите в Settings → Secrets and variables → Actions в вашем репозитории и добавьте:

### Обязательные secrets:
- `SERVER_HOST` - IP адрес сервера
- `SERVER_USER` - имя пользователя (обычно root или созданный пользователь)
- `SERVER_SSH_KEY` - приватный SSH ключ
- `SERVER_PORT` - порт SSH (обычно 22)

### Как получить SSH ключ:
```bash
# На вашем сервере выполните:
cat ~/.ssh/id_ed25519
# Если ключа нет, создайте:
ssh-keygen -t ed25519 -N ""
```

## Проверка настройки

1. Сделайте любой коммит в main ветку
2. Перейдите в Actions на GitHub
3. Убедитесь, что деплой прошел успешно
4. На сервере проверьте статус бота:
   ```bash
   pm2 status
   pm2 logs veo-bot
   ```

## Troubleshooting

### Если бот не запускается:
```bash
cd /home/veo-bot/bot
node src/index.js
```

### Если ошибки с правами:
```bash
sudo chown -R veobot:veobot /home/veo-bot
```

### Если проблемы с зависимостями:
```bash
cd /home/veo-bot/bot
rm -rf node_modules package-lock.json
npm install
``` 