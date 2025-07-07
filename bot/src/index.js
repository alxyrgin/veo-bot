require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./utils/logger');
const { initializeDatabase } = require('./database/init');
const { handleStart } = require('./handlers/start');
const { handleMessage } = require('./handlers/message');
const { handleCallback } = require('./handlers/callback');
const { handlePayment } = require('./handlers/payment');

// Инициализация бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Инициализация базы данных
async function initBot() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');
    
    // Обработчики команд
    bot.onText(/\/start/, (msg) => handleStart(msg, bot));
    bot.onText(/\/help/, (msg) => handleHelp(msg, bot));
    bot.onText(/\/balance/, (msg) => handleBalance(msg, bot));
    bot.onText(/\/generate/, (msg) => handleGenerate(msg, bot));
    
    // Обработчики сообщений
    bot.on('message', (msg) => {
      // Пропускаем команды (они обрабатываются отдельно)
      if (msg.text && msg.text.startsWith('/')) {
        return;
      }
      handleMessage(msg, bot);
    });
    
    bot.on('callback_query', (query) => handleCallback(query, bot));
    
    // Обработчики платежей
    bot.on('pre_checkout_query', (query) => handlePayment.preCheckout(query, bot));
    bot.on('successful_payment', (msg) => handlePayment.success(msg, bot));
    
    // Обработка ошибок
    bot.on('error', (error) => {
      logger.error('Bot error:', error);
    });
    
    bot.on('polling_error', (error) => {
      logger.error('Polling error:', error);
    });
    
    logger.info('Bot started successfully!');
    console.log('🤖 VEO 3 Bot запущен!');
    
  } catch (error) {
    logger.error('Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Дополнительные обработчики команд
async function handleHelp(msg, bot) {
  const chatId = msg.chat.id;
  
  const message = `❓ <b>Помощь</b>

<b>Доступные команды:</b>
• /start - Главное меню
• /help - Эта справка
• /balance - Проверить баланс
• /generate - Создать видео

<b>Как создать видео:</b>
1. Используйте /start или кнопку "🎬 Создать видео"
2. Выберите режим генерации
3. Опишите желаемое видео
4. Дождитесь результата

<b>Поддержка:</b>
По всем вопросам обращайтесь к @support_bot`;

  await bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
      ]
    }
  });
}

async function handleBalance(msg, bot) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const { getUserByTelegramId } = require('./database/models');
    const user = await getUserByTelegramId(userId);
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Пользователь не найден. Используйте /start для регистрации.');
      return;
    }
    
    const message = `💰 <b>Ваш баланс</b>

💎 <b>Кредиты:</b> ${user.credits}
📊 <b>Создано видео:</b> ${user.total_videos_generated}
📅 <b>Регистрация:</b> ${new Date(user.created_at).toLocaleDateString('ru-RU')}`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💳 Купить кредиты', callback_data: 'buy_credits' },
            { text: '📊 История', callback_data: 'history_full' }
          ],
          [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleBalance command:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при получении баланса.');
  }
}

async function handleGenerate(msg, bot) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const { getUserByTelegramId } = require('./database/models');
    const user = await getUserByTelegramId(userId);
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Пользователь не найден. Используйте /start для регистрации.');
      return;
    }
    
    if (user.credits < 1) {
      await bot.sendMessage(chatId, '💰 У вас недостаточно кредитов для создания видео.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Купить кредиты', callback_data: 'buy_credits' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    const message = `🎬 <b>Создание видео</b>

💎 <b>Ваш баланс:</b> ${user.credits} кредитов

<b>Выберите режим генерации:</b>`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⚡ Быстрый (1 кредит)', callback_data: 'generate_fast' },
            { text: '💎 Премиум (2 кредита)', callback_data: 'generate_premium' }
          ],
          [{ text: '🔙 Назад', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleGenerate command:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при создании видео.');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Bot is shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Bot is shutting down...');
  bot.stopPolling();
  process.exit(0);
});

// Запуск бота
initBot();

module.exports = bot; 