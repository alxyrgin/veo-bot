const { getUserByTelegramId, getUserTransactions, getUserVideoGenerations } = require('../database/models');
const logger = require('../utils/logger');

async function handleCallback(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;
  
  try {
    // Подтверждаем получение callback
    await bot.answerCallbackQuery(query.id);
    
    // Обработка различных типов callback
    switch (data) {
      case 'create_video':
        await handleCreateVideo(query, bot);
        break;
      case 'balance':
        await handleBalance(query, bot);
        break;
      case 'buy_credits':
        await handleBuyCredits(query, bot);
        break;
      case 'referral':
        await handleReferral(query, bot);
        break;
      case 'help':
        await handleHelp(query, bot);
        break;
      case 'tutorial':
        await handleTutorial(query, bot);
        break;
      case 'back_to_menu':
        await handleBackToMenu(query, bot);
        break;
      default:
        if (data.startsWith('generate_')) {
          await handleGenerateVideo(query, bot);
        } else if (data.startsWith('buy_')) {
          await handleBuyPackage(query, bot);
        } else if (data.startsWith('history_')) {
          await handleHistory(query, bot);
        } else {
          await bot.sendMessage(chatId, '❓ Неизвестная команда. Используйте /start для возврата в главное меню.');
        }
    }
    
  } catch (error) {
    logger.error('Error in handleCallback:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
  }
}

async function handleCreateVideo(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  try {
    const user = await getUserByTelegramId(userId);
    
    if (!user) {
      await bot.sendMessage(chatId, '❌ Пользователь не найден. Используйте /start для регистрации.');
      return;
    }
    
    if (user.credits < 1) {
      await bot.sendMessage(chatId, '💰 У вас недостаточно кредитов для создания видео.\n\nДля создания видео нужен минимум 1 кредит.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Купить кредиты', callback_data: 'buy_credits' }],
            [{ text: '🔙 Назад', callback_data: 'back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    const message = `🎬 <b>Создание видео</b>

💎 <b>Ваш баланс:</b> ${user.credits} кредитов

<b>Режимы генерации:</b>
⚡ <b>Быстрый</b> - 5 сек, 1 кредит
💎 <b>Премиум</b> - 10 сек, 2 кредита

<b>Как создать видео:</b>
1. Выберите режим генерации
2. Опишите, что хотите увидеть в видео
3. Или отправьте голосовое сообщение

<i>Например: "Красивый закат над океаном с летающими чайками"</i>`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
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
    logger.error('Error in handleCreateVideo:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке меню создания видео.');
  }
}

async function handleBalance(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  try {
    const user = await getUserByTelegramId(userId);
    const transactions = await getUserTransactions(user.id, 5);
    
    let message = `💰 <b>Ваш баланс</b>

💎 <b>Кредиты:</b> ${user.credits}
📊 <b>Создано видео:</b> ${user.total_videos_generated}

<b>Последние транзакции:</b>
`;

    if (transactions.length > 0) {
      transactions.forEach((transaction, index) => {
        const date = new Date(transaction.created_at).toLocaleDateString('ru-RU');
        const type = getTransactionTypeText(transaction.type);
        const sign = transaction.credits_change > 0 ? '+' : '';
        message += `${index + 1}. ${date} - ${type} ${sign}${transaction.credits_change} кредитов\n`;
      });
    } else {
      message += '<i>Транзакций пока нет</i>';
    }

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💳 Купить кредиты', callback_data: 'buy_credits' },
            { text: '📊 История', callback_data: 'history_full' }
          ],
          [{ text: '🔙 Назад', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleBalance:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке баланса.');
  }
}

async function handleBuyCredits(query, bot) {
  const chatId = query.message.chat.id;
  
  const message = `💳 <b>Покупка кредитов</b>

<b>Доступные пакеты:</b>

💎 <b>Стартовый</b> - 5 кредитов
💰 150 рублей

💎 <b>Популярный</b> - 10 кредитов
💰 250 рублей (экономия 50₽)

💎 <b>Премиум</b> - 25 кредитов
💰 500 рублей (экономия 250₽)

💎 <b>Безлимитный</b> - 50 кредитов
💰 800 рублей (экономия 700₽)

<b>Способы оплаты:</b>
• Российские карты (Visa, MasterCard, МИР)
• Telegram Payments
• Быстрые платежи через банк`;

  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: query.message.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💎 5 кредитов - 150₽', callback_data: 'buy_starter' },
          { text: '💎 10 кредитов - 250₽', callback_data: 'buy_popular' }
        ],
        [
          { text: '💎 25 кредитов - 500₽', callback_data: 'buy_premium' },
          { text: '💎 50 кредитов - 800₽', callback_data: 'buy_unlimited' }
        ],
        [{ text: '🔙 Назад', callback_data: 'back_to_menu' }]
      ]
    }
  });
}

async function handleReferral(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  try {
    const user = await getUserByTelegramId(userId);
    
    const referralLink = `https://t.me/${process.env.BOT_USERNAME}?start=${user.referral_code}`;
    
    const message = `👥 <b>Реферальная программа</b>

🎁 <b>Ваши бонусы:</b>
• За каждого друга: +2 кредита
• За покупку друга: +5 кредитов

<b>Ваша реферальная ссылка:</b>
<code>${referralLink}</code>

<b>Как это работает:</b>
1. Поделитесь ссылкой с друзьями
2. Друг регистрируется в боте
3. Вы получаете 2 кредита
4. Когда друг покупает кредиты, вы получаете еще 5

<b>Статистика:</b>
🔗 <b>Реферальный код:</b> ${user.referral_code}
👥 <b>Приглашено друзей:</b> 0
💰 <b>Заработано кредитов:</b> 0`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📤 Поделиться ссылкой', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🎬 Создавай крутые видео с ИИ! Получи бесплатный кредит:')}` }],
          [{ text: '🔙 Назад', callback_data: 'back_to_menu' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleReferral:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке реферальной программы.');
  }
}

async function handleHelp(query, bot) {
  const chatId = query.message.chat.id;
  
  const message = `❓ <b>Помощь</b>

<b>Команды бота:</b>
• /start - Главное меню
• /help - Эта справка
• /balance - Проверить баланс
• /generate - Создать видео

<b>Как создать видео:</b>
1. Нажмите "🎬 Создать видео"
2. Выберите режим (быстрый или премиум)
3. Опишите желаемое видео
4. Дождитесь генерации

<b>Советы для лучших результатов:</b>
• Описывайте подробно сцену
• Указывайте время суток, погоду
• Описывайте действия персонажей
• Используйте конкретные детали

<b>Поддержка:</b>
По всем вопросам обращайтесь к @support_bot`;

  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: query.message.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'back_to_menu' }]
      ]
    }
  });
}

async function handleTutorial(query, bot) {
  const chatId = query.message.chat.id;
  
  const message = `📖 <b>Туториал</b>

<b>🎬 Создание крутых видео:</b>

<b>1. Выберите режим</b>
• ⚡ Быстрый - для тестов и идей
• 💎 Премиум - для качественного контента

<b>2. Опишите сцену</b>
✅ Хорошо: "Молодой человек в джинсах идет по осеннему парку на закате, листья кружатся на ветру"
❌ Плохо: "Человек идет"

<b>3. Используйте ключевые слова</b>
• Время: утро, день, вечер, ночь
• Погода: солнечно, дождь, туман
• Стиль: кинематографический, реалистичный
• Движения: медленно, быстро, плавно

<b>4. Примеры промптов</b>
• "Кот играет с мячом в солнечной комнате"
• "Волны разбиваются о скалы на закате"
• "Девушка танцует в поле подсолнухов"

<b>💡 Совет:</b> Говорите боту голосовыми сообщениями!`;

  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: query.message.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🎬 Создать видео', callback_data: 'create_video' },
          { text: '🔙 Назад', callback_data: 'back_to_menu' }
        ]
      ]
    }
  });
}

async function handleBackToMenu(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  try {
    const user = await getUserByTelegramId(userId);
    
    const message = `👋 <b>Главное меню</b>

Привет, ${user.first_name}!

💎 <b>Ваш баланс:</b> ${user.credits} кредитов
📊 <b>Создано видео:</b> ${user.total_videos_generated}

Что будем делать? 🚀`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎬 Создать видео', callback_data: 'create_video' },
            { text: '💰 Баланс', callback_data: 'balance' }
          ],
          [
            { text: '💳 Купить кредиты', callback_data: 'buy_credits' },
            { text: '👥 Рефералы', callback_data: 'referral' }
          ],
          [
            { text: '❓ Помощь', callback_data: 'help' },
            { text: '📖 Туториал', callback_data: 'tutorial' }
          ]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleBackToMenu:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке главного меню.');
  }
}

async function handleGenerateVideo(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  try {
    const user = await getUserByTelegramId(userId);
    const videoType = query.data.replace('generate_', '');
    const creditsRequired = videoType === 'fast' ? 1 : 2;
    
    if (user.credits < creditsRequired) {
      await bot.sendMessage(chatId, `❌ Недостаточно кредитов для генерации ${videoType === 'fast' ? 'быстрого' : 'премиум'} видео.\n\nТребуется: ${creditsRequired} кредитов\nУ вас: ${user.credits} кредитов`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Купить кредиты', callback_data: 'buy_credits' }],
            [{ text: '🔙 Назад', callback_data: 'create_video' }]
          ]
        }
      });
      return;
    }
    
    const message = `🎬 <b>Создание ${videoType === 'fast' ? 'быстрого' : 'премиум'} видео</b>

Режим выбран: ${videoType === 'fast' ? '⚡ Быстрый (5 сек, 1 кредит)' : '💎 Премиум (10 сек, 2 кредита)'}

<b>Теперь опишите ваше видео:</b>
• Напишите текстом что хотите увидеть
• Или отправьте голосовое сообщение

<i>Например: "Красивый рассвет над горами с туманом"</i>

💡 <b>Совет:</b> Чем подробнее описание, тем лучше результат!`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_video' }]
        ]
      }
    });
    
    // Сохраняем состояние пользователя для следующего сообщения
    // TODO: Реализовать сохранение состояния для продолжения генерации
    
  } catch (error) {
    logger.error('Error in handleGenerateVideo:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при подготовке генерации видео.');
  }
}

async function handleBuyPackage(query, bot) {
  const chatId = query.message.chat.id;
  const packageType = query.data.replace('buy_', '');
  
  // TODO: Реализовать интеграцию с системой платежей
  await bot.sendMessage(chatId, `💳 Покупка пакета: ${packageType}\n\n⚠️ Система платежей в разработке...`);
}

async function handleHistory(query, bot) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  try {
    const user = await getUserByTelegramId(userId);
    const generations = await getUserVideoGenerations(user.id, 10);
    
    let message = `📊 <b>История генераций</b>\n\n`;
    
    if (generations.length > 0) {
      generations.forEach((gen, index) => {
        const date = new Date(gen.created_at).toLocaleDateString('ru-RU');
        const status = gen.status === 'completed' ? '✅' : gen.status === 'failed' ? '❌' : '⏳';
        message += `${index + 1}. ${date} - ${status} ${gen.video_type} (${gen.credits_used} кредитов)\n`;
      });
    } else {
      message += '<i>Генераций пока нет</i>';
    }
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'balance' }]
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error in handleHistory:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при загрузке истории.');
  }
}

function getTransactionTypeText(type) {
  switch (type) {
    case 'purchase': return '💳 Покупка';
    case 'generation': return '🎬 Генерация';
    case 'referral': return '👥 Реферал';
    default: return '❓ Неизвестно';
  }
}

module.exports = {
  handleCallback
}; 