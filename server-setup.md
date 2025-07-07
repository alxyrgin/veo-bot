# Настройка сервера для автоматического деплоя

## Что нужно сделать на сервере (ОДИН РАЗ):

### 1. Установить Node.js
```bash
# Обновляем систему
sudo apt update

# Устанавливаем Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверяем установку
node --version
npm --version
```

### 2. Установить Git
```bash
sudo apt install git -y
```

### 3. Установить PM2 (опционально, но рекомендуется)
```bash
sudo npm install -g pm2
```

### 4. Создать пользователя для бота (рекомендуется)
```bash
sudo adduser veobot
sudo usermod -aG sudo veobot
su - veobot
```

### 5. Настроить SSH ключи на сервере
```bash
# Генерируем SSH ключ для деплоя (если нужно)
ssh-keygen -t ed25519 -C "deploy@veo-bot"

# Показываем публичный ключ (добавить в GitHub Deploy Keys)
cat ~/.ssh/id_ed25519.pub
```

## Настройка GitHub Secrets

В настройках репозитория на GitHub (Settings → Secrets and variables → Actions) добавить:

1. **SERVER_HOST** - IP адрес вашего сервера
2. **SERVER_USER** - имя пользователя на сервере (например: `veobot` или `root`)
3. **SERVER_SSH_KEY** - приватный SSH ключ для подключения к серверу
4. **SERVER_PORT** - порт SSH (обычно 22)

### Как получить SSH ключ:
```bash
# На сервере выполнить:
cat ~/.ssh/id_ed25519
# Или создать новый ключ специально для деплоя:
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key
```

## Настройка окружения на сервере

1. Создать файл `.env` в директории `/home/veo-bot/bot/`:
```bash
mkdir -p /home/veo-bot/bot
cd /home/veo-bot/bot
nano .env
```

2. Добавить в `.env` все необходимые переменные:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
SUPABASE_URL=ваш_supabase_url
SUPABASE_ANON_KEY=ваш_supabase_anon_key
# ... остальные переменные из .env.example
```

## Первый запуск

После настройки сделайте коммит в main ветку - автоматический деплой запустится!

## Проверка работы

```bash
# Проверить статус PM2
pm2 status

# Посмотреть логи
pm2 logs veo-bot

# Или если PM2 не используется
ps aux | grep node
tail -f /home/veo-bot/bot/bot.log
```

## Полезные команды

```bash
# Перезапустить бота вручную
pm2 restart veo-bot

# Остановить бота
pm2 stop veo-bot

# Посмотреть логи в реальном времени
pm2 logs veo-bot --lines 100
```

## Проверка места на диске

```bash
du -h --max-depth=1 /
```

## Как исправить

1. **Сделай владельцем все файлы и папки пользователя `veobot`:**
   ```bash
   sudo chown -R veobot:veobot /home/veobot
   ```
   Это рекурсивно поменяет владельца на все файлы и папки в домашней директории `veobot`.

2. **Проверь права:**
   - После этого все файлы должны быть с владельцем `veobot`.
   - Если используешь SFTP/FTP — обнови окно, чтобы увидеть изменения.