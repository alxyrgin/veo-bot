const { getUserByTelegramId, createVideoGeneration, updateUserCredits } = require('../database/models');
const logger = require('../utils/logger');

// Временное хранение состояний пользователей
const userStates = new Map();

async function handleMessage(msg, bot) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Проверяем, есть ли пользователь в базе
    const user = await getUserByTelegramId(userId);
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Пользователь не найден. Используйте /start для регистрации.');
      return;
    }
    
    // Если это голосовое сообщение, сначала расшифровываем его
    if (msg.voice) {
      await handleVoiceMessage(msg, bot, user);
      return;
    }
    
    // Если это текстовое сообщение, считаем его промптом для генерации видео
    if (msg.text) {
      await handleTextPrompt(msg, bot, user);
      return;
    }
    
    // Если это другой тип сообщения
    await bot.sendMessage(chatId, '❓ Я понимаю только текстовые и голосовые сообщения. Попробуйте описать видео текстом или голосом.');
    
  } catch (error) {
    logger.error('Error in handleMessage:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при обработке сообщения. Попробуйте позже.');
  }
}

async function handleTextPrompt(msg, bot, user) {
  const chatId = msg.chat.id;
  const prompt = msg.text;
  
  try {
    // Проверяем, достаточно ли кредитов для минимальной генерации
    if (user.credits < 1) {
      await bot.sendMessage(chatId, '💰 У вас недостаточно кредитов для создания видео.\n\nДля создания видео нужен минимум 1 кредит.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Купить кредиты', callback_data: 'buy_credits' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    // Показываем варианты генерации
    const message = `🎬 <b>Создание видео</b>

<b>Ваш промпт:</b> "${prompt}"

💎 <b>Ваш баланс:</b> ${user.credits} кредитов

<b>Выберите режим генерации:</b>`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⚡ Быстрый (1 кредит)', callback_data: `generate_fast_${encodePrompt(prompt)}` },
            { text: '💎 Премиум (2 кредита)', callback_data: `generate_premium_${encodePrompt(prompt)}` }
          ],
          [{ text: '✏️ Изменить описание', callback_data: 'create_video' }],
          [{ text: '🔙 Отменить', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleTextPrompt:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при обработке промпта.');
  }
}

async function handleVoiceMessage(msg, bot, user) {
  const chatId = msg.chat.id;
  
  try {
    // Отправляем сообщение о том, что обрабатываем голосовое сообщение
    const processingMessage = await bot.sendMessage(chatId, '🎤 Обрабатываю голосовое сообщение...');
    
    // TODO: Реализовать расшифровку голосового сообщения
    // Пока что эмулируем расшифровку
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transcribedText = "Молодой человек идет по осеннему парку на закате"; // Заглушка
    
    await bot.editMessageText(`🎤 <b>Голосовое сообщение расшифровано:</b>\n\n"${transcribedText}"\n\n💎 <b>Ваш баланс:</b> ${user.credits} кредитов\n\n<b>Выберите режим генерации:</b>`, {
      chat_id: chatId,
      message_id: processingMessage.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⚡ Быстрый (1 кредит)', callback_data: `generate_fast_${encodePrompt(transcribedText)}` },
            { text: '💎 Премиум (2 кредита)', callback_data: `generate_premium_${encodePrompt(transcribedText)}` }
          ],
          [{ text: '✏️ Изменить описание', callback_data: 'create_video' }],
          [{ text: '🔙 Отменить', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleVoiceMessage:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при обработке голосового сообщения.');
  }
}

// Функция для кодирования промпта в callback_data
function encodePrompt(prompt) {
  // Обрезаем до 50 символов и кодируем в base64
  const truncated = prompt.substring(0, 50);
  return Buffer.from(truncated).toString('base64').replace(/[+/=]/g, '');
}

// Функция для декодирования промпта из callback_data
function decodePrompt(encodedPrompt) {
  try {
    return Buffer.from(encodedPrompt, 'base64').toString('utf-8');
  } catch (error) {
    logger.error('Error decoding prompt:', error);
    return null;
  }
}

// Функция для обработки генерации видео (будет вызываться из callback handler)
async function processVideoGeneration(userId, prompt, videoType, bot) {
  const chatId = userId; // В реальности нужно получить chatId из базы или кэша
  
  try {
    const user = await getUserByTelegramId(userId);
    const creditsRequired = videoType === 'fast' ? 1 : 2;
    
    if (user.credits < creditsRequired) {
      throw new Error('Insufficient credits');
    }
    
    // Создаем запись о генерации в базе данных
    const generation = await createVideoGeneration({
      user_id: user.id,
      prompt_original: prompt,
      prompt_enhanced: prompt, // TODO: Улучшить промпт с помощью AI
      video_type: videoType,
      credits_used: creditsRequired,
      status: 'processing'
    });
    
    // Списываем кредиты
    await updateUserCredits(user.id, -creditsRequired, `Генерация ${videoType} видео`);
    
    // Отправляем сообщение о начале генерации
    const processingMessage = await bot.sendMessage(chatId, `🎬 <b>Генерация началась!</b>

<b>Режим:</b> ${videoType === 'fast' ? '⚡ Быстрый' : '💎 Премиум'}
<b>Промпт:</b> "${prompt}"
<b>Использовано кредитов:</b> ${creditsRequired}

⏳ <b>Обработка...</b> Это может занять несколько минут.

💡 <b>Совет:</b> Пока видео генерируется, вы можете создать еще одно!`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎬 Создать еще видео', callback_data: 'create_video' }],
          [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
    // TODO: Запустить процесс генерации с VEO 3 API
    // Пока что эмулируем процесс генерации
    simulateVideoGeneration(generation.id, chatId, bot);
    
    logger.info(`Video generation started: ${generation.id} for user ${userId}`);
    
  } catch (error) {
    logger.error('Error in processVideoGeneration:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при начале генерации видео.');
  }
}

// Эмуляция процесса генерации (для тестирования)
async function simulateVideoGeneration(generationId, chatId, bot) {
  // Ждем 30 секунд (имитация генерации)
  setTimeout(async () => {
    try {
      // Обновляем статус генерации в базе данных
      const { updateVideoGeneration } = require('../database/models');
      await updateVideoGeneration(generationId, {
        status: 'completed',
        file_url: 'https://example.com/generated_video.mp4',
        file_size_mb: 5.2,
        duration_seconds: 10,
        completed_at: new Date().toISOString()
      });
      
      // Отправляем результат пользователю
      await bot.sendMessage(chatId, `🎉 <b>Видео готово!</b>

Ваше видео успешно сгенерировано!

📹 <b>Размер:</b> 5.2 МБ
⏱️ <b>Длительность:</b> 10 секунд
✅ <b>Статус:</b> Готово

🔗 <b>Ссылка на скачивание:</b> https://example.com/generated_video.mp4`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎬 Создать еще видео', callback_data: 'create_video' }],
            [{ text: '💰 Баланс', callback_data: 'balance' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
          ]
        }
      });
      
    } catch (error) {
      logger.error('Error in video generation completion:', error);
      await bot.sendMessage(chatId, '❌ Произошла ошибка при завершении генерации видео.');
    }
  }, 30000); // 30 секунд
}

module.exports = {
  handleMessage,
  processVideoGeneration,
  encodePrompt,
  decodePrompt
}; 