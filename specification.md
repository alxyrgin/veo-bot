# Техническое задание: Telegram-бот для генерации видео с VEO 3

## 🎯 Краткое описание проекта

Создание Telegram-бота, предоставляющего платный доступ к модели Google VEO 3 для генерации реалистичных видео с озвучкой на русском языке. Позиционирование: удобный генератор видео без ВПН и подписок, с оплатой российскими картами за каждую генерацию.

## 🏗 Архитектура проекта

### Компоненты системы:
1. **Telegram-бот** (основной функционал)
2. **VEO 3 API Integration** (через Vertex AI)
3. **Supabase Database** (хранение данных)
4. **Admin Dashboard** (React-приложение для управления)
5. **Payment System** (интеграция с российскими платежными системами)

## 📱 Telegram-бот: Подробная спецификация

### Технологический стек:
- **Runtime:** Node.js/Python 
- **Framework:** Telegram Bot API
- **Database:** Supabase (PostgreSQL)
- **Deployment:** VPS Biget
- **Development:** MCP Task Manager в Cursor

### Пользовательский флоу:

#### 🚀 Первое подключение:
1. **Приветственное сообщение:**
   ```
   Привет! 👋
   
   Это ВЕО — умею генерировать сверхреалистичные видео с озвучкой на русском языке!
   
   🎬 Вирусные ролики или кинематографические кадры — всё, что захочешь ты!
   
   ✅ Без ВПН, в одном боте
   🎁 Первая генерация: бесплатно — попробуй
   
   Давай покажу, как я работаю ↓
   
   [Дальше →]
   ```

2. **Мини-инструкция** (2-3 экрана):
   - Что умеет бот
   - Примеры промптов
   - Результаты генерации

3. **Автоматическая регистрация** пользователя в Supabase

#### 📋 Главное меню:
```
🎬 Создать видео
💰 Мой баланс: X кредитов
🛒 Купить кредиты
👥 Реферальная программа
📚 Как создавать вирусные видео
```

#### 🎥 Процесс генерации видео:

1. **Ввод промпта:**
   - Голосовое сообщение (автоматическая расшифровка)
   - Текстовое сообщение
   
2. **Обработка промпта:**
   - Если голосовое → расшифровка в текст
   - Улучшение промпта через бесплатную LLM (OpenRouter)
   - Перевод и оптимизация для VEO 3 на английском

3. **Выбор качества:**
   - 🚀 VEO 3 Fast: 2 кредита
   - 💎 VEO 3 Premium: 10 кредитов

4. **Генерация и отправка видео**

### 💳 Система оплаты и кредитов:

#### Тарифная сетка:
| Пакет | Кредиты | Цена | Цена за кредит |
|-------|---------|------|----------------|
| Стартовый | 5 | 199₽ | 39.8₽ |
| Популярный | 15 | 499₽ | 33.3₽ |
| Выгодный | 35 | 999₽ | 28.5₽ |
| Мега | 75 | 1999₽ | 26.7₽ |

#### Использование кредитов:
- **VEO 3 Fast:** 2 кредита (5-секундное видео, быстрая генерация)
- **VEO 3 Premium:** 10 кредитов (8-секундное видео, максимальное качество)

#### Первая генерация:
- **Бесплатная** для всех новых пользователей (VEO 3 Fast)

### 🤝 Реферальная программа:

- **За каждого приведенного друга:** +2 кредита рефералу
- **При первой покупке реферала:** +5 кредитов рефералу
- **Реферальная ссылка:** `t.me/your_bot?start=ref_USER_ID`

### 🔐 База данных Supabase:

#### Таблица `users`:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  credits INTEGER DEFAULT 1, -- 1 бесплатный кредит
  total_videos_generated INTEGER DEFAULT 0,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

#### Таблица `transactions`:
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('purchase', 'generation', 'referral')),
  credits_change INTEGER,
  amount_rub DECIMAL(10,2), -- для покупок
  telegram_payment_id TEXT, -- ID платежа из Telegram
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Таблица `video_generations`:
```sql
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

## 🔌 VEO 3 API Интеграция

### Стратегия минимизации затрат:

1. **Ротация Google Cloud аккаунтов:**
   - Использование $300 бесплатных кредитов на новых аккаунтах
   - Автоматическое переключение между API ключами
   - Мониторинг остатка кредитов

2. **Оптимизация запросов:**
   - Кэширование популярных промптов
   - Ограничение на количество генераций в день для новых пользователей

### Расчет юнит-экономики:

#### Затраты на VEO 3:
- **Стоимость генерации:** $0.35 за секунду
- **VEO 3 Fast (5 сек):** $1.75 ≈ 175₽
- **VEO 3 Premium (8 сек):** $2.8 ≈ 280₽

#### Наша цена для пользователей:
- **VEO 3 Fast:** 2 кредита = 66₽ (при покупке пакета "Популярный")
- **VEO 3 Premium:** 10 кредитов = 333₽

#### Проблема рентабельности:
**КРИТИЧЕСКАЯ ПРОБЛЕМА:** При текущих ценах VEO 3 проект убыточен!

#### Предлагаемое решение:
1. **Максимальное использование бесплатных кредитов** Google Cloud
2. **Повышение цен:**
   - VEO 3 Fast: 5 кредитов = 165₽
   - VEO 3 Premium: 15 кредитов = 500₽
3. **Альтернативный подход:** Ограниченное количество генераций в день

### Техническая реализация:

```javascript
// Пример интеграции с VEO 3 API
const generateVideo = async (prompt, quality = 'fast') => {
  const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-preview:predict`;
  
  const payload = {
    instances: [{
      prompt: prompt,
      sampleCount: 1,
      videoDuration: quality === 'fast' ? '5s' : '8s',
      aspectRatio: '16:9'
    }]
  };
  
  // Ротация API ключей
  const apiKey = await getActiveApiKey();
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return response.json();
};
```

## 💰 Интеграция платежей

### Поддерживаемые платежные системы:
1. **Telegram Payments** (основной способ)
2. **YooKassa** (российские карты)
3. **Tinkoff Acquiring**
4. **QIWI** (если доступно)

### Реализация через Telegram Payments:

```javascript
// Создание инвойса
bot.onText(/💰 Купить кредиты/, async (msg) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: '5 кредитов - 199₽', callback_data: 'buy_5' }],
      [{ text: '15 кредитов - 499₽', callback_data: 'buy_15' }],
      [{ text: '35 кредитов - 999₽', callback_data: 'buy_35' }],
      [{ text: '75 кредитов - 1999₽', callback_data: 'buy_75' }]
    ]
  };
  
  bot.sendMessage(msg.chat.id, 'Выберите пакет кредитов:', { reply_markup: keyboard });
});

// Обработка покупки
bot.on('callback_query', async (query) => {
  if (query.data.startsWith('buy_')) {
    const package = packages[query.data];
    
    await bot.sendInvoice(query.message.chat.id, {
      title: `${package.credits} кредитов для генерации видео`,
      description: `Пакет кредитов для создания видео с помощью VEO 3`,
      payload: JSON.stringify({ userId: query.from.id, package: query.data }),
      provider_token: PAYMENT_TOKEN,
      currency: 'RUB',
      prices: [{ label: 'Кредиты', amount: package.price * 100 }]
    });
  }
});
```

## 🎛 Admin Dashboard

### Функционал:
1. **Аналитика:**
   - Общее количество пользователей
   - Активные пользователи (24ч)
   - Количество сгенерированных видео
   - Общая выручка
   - Конверсия в покупки

2. **Управление пользователями:**
   - Список всех пользователей
   - История транзакций
   - Возможность начислить/списать кредиты

3. **Управление платежами:**
   - История всех платежей
   - Статусы платежей
   - Рефанды

4. **Настройки бота:**
   - Управление API ключами VEO 3
   - Настройка цен
   - Управление реферальной программой

### Технический стек Dashboard:
- **React** (существующая заготовка)
- **Supabase Client** для работы с данными
- **Chart.js/Recharts** для графиков
- **Tailwind CSS** для стилизации

## 🚀 Развертывание и хостинг

### VPS Biget конфигурация:
- **OS:** Ubuntu 22.04 LTS
- **Node.js:** v18+
- **PM2** для управления процессами
- **Nginx** как reverse proxy
- **SSL:** Let's Encrypt

### Пошаговая инструкция развертывания:

```bash
# 1. Обновление системы
sudo apt update && sudo apt upgrade -y

# 2. Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Установка PM2
npm install -g pm2

# 4. Клонирование проекта
git clone <repository-url>
cd telegram-veo3-bot

# 5. Установка зависимостей
npm install

# 6. Настройка environment variables
cp .env.example .env
# Редактирование .env файла

# 7. Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Environment Variables:

```env
# Telegram Bot
BOT_TOKEN=your_bot_token
PAYMENT_TOKEN=your_payment_provider_token

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google Cloud / VEO 3
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
PROJECT_ID=your_google_project_id

# OpenRouter (для улучшения промптов)
OPENROUTER_API_KEY=your_openrouter_key
```

## 📊 Метрики и аналитика

### Ключевые метрики:
1. **DAU/MAU** - дневные/месячные активные пользователи
2. **Conversion Rate** - конверсия в покупку
3. **ARPU** - средний доход на пользователя
4. **LTV** - lifetime value пользователя
5. **Referral Rate** - эффективность реферальной программы

### События для отслеживания:
- Регистрация нового пользователя
- Первая генерация видео
- Покупка кредитов
- Использование реферальной ссылки
- Возврат пользователя

## 🔄 Roadmap развития

### Phase 1 (MVP):
- ✅ Базовый функционал бота
- ✅ Интеграция с VEO 3
- ✅ Простая система оплаты
- ✅ Базовая аналитика

### Phase 2 (Улучшения):
- 🔄 Расширенная реферальная программа
- 🔄 Больше платежных методов
- 🔄 Улучшенный промпт-инжиниринг
- 🔄 Система достижений

### Phase 3 (Масштабирование):
- 🔄 API для партнеров
- 🔄 WhatsApp Bot
- 🔄 Веб-интерфейс
- 🔄 Интеграция с другими AI-моделями

## ⚠️ Риски и ограничения

1. **Высокая стоимость VEO 3:** Основная проблема рентабельности
2. **Ограничения Google Cloud:** Лимиты на бесплатные кредиты
3. **Конкуренция:** Появление аналогичных сервисов
4. **Регулирование:** Возможные ограничения на AI-контент

## 🎯 Рекомендации по запуску

1. **Начать с высоких цен** и тестировать demand
2. **Активно использовать бесплатные кредиты** Google Cloud
3. **Сфокусироваться на качестве** первых пользователей
4. **Быстро итерировать** на основе фидбека
5. **Рассмотреть альтернативные модели** генерации видео для снижения затрат

---

**Важное примечание:** Текущая экономика проекта требует корректировки цен или поиска альтернативных AI-моделей для достижения рентабельности.