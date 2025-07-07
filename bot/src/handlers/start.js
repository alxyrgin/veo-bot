const { createUser, getUserByTelegramId } = require('../database/models');
const logger = require('../utils/logger');

async function handleStart(msg, bot) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  
  try {
    // Проверяем, есть ли пользователь в базе данных
    let user = await getUserByTelegramId(userId);
    
    // Если пользователь новый, создаем его
    if (!user) {
      // Проверяем, есть ли реферальный код в сообщении
      const referralCode = extractReferralCode(msg.text);
      let referredBy = null;
      
      if (referralCode) {
        // Ищем пользователя по реферальному коду
        const referrer = await getUserByReferralCode(referralCode);
        if (referrer) {
          referredBy = referrer.id;
        }
      }
      
      user = await createUser(userId, username, firstName, referredBy);
      
      // Если пользователь пришел по реферальной ссылке, начисляем бонусы
      if (referredBy) {
        await processReferralBonus(referredBy, user.id);
      }
    }
    
    // Создаем приветственное сообщение
    const welcomeMessage = user.total_videos_generated === 0 
      ? createWelcomeMessage(user)
      : createReturnMessage(user);
    
    // Отправляем сообщение с inline клавиатурой
    await bot.sendMessage(chatId, welcomeMessage, {
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
    
    logger.info(`User interaction: ${userId} - start command`);
    
  } catch (error) {
    logger.error('Error in handleStart:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при регистрации. Попробуйте позже.');
  }
}

function createWelcomeMessage(user) {
  return `🎉 <b>Добро пожаловать в VEO 3 Bot!</b>

Привет, ${user.first_name}! 👋

Я помогу тебе создавать реалистичные видео с помощью искусственного интеллекта Google VEO 3.

💎 <b>Твой баланс:</b> ${user.credits} кредитов
🎁 <b>Подарок:</b> Первое видео бесплатно!

<b>Что умеет бот:</b>
• 🎬 Создавать видео из текста
• ⚡ Быстрая генерация (5 секунд)
• 💎 Премиум качество (10 секунд)
• 🗣️ Понимает голосовые сообщения

Просто опиши, какое видео хочешь создать, и я всё сделаю! 🚀`;
}

function createReturnMessage(user) {
  return `👋 <b>С возвращением, ${user.first_name}!</b>

💎 <b>Твой баланс:</b> ${user.credits} кредитов
📊 <b>Создано видео:</b> ${user.total_videos_generated}

Готов создать новое видео? 🎬`;
}

function extractReferralCode(text) {
  if (!text) return null;
  
  // Ищем реферальный код в формате /start referral_code
  const match = text.match(/\/start\s+(\w+)/);
  return match ? match[1] : null;
}

async function processReferralBonus(referrerId, newUserId) {
  try {
    // Начисляем бонус рефереру
    await updateUserCredits(referrerId, 2, 'Реферальный бонус за привлечение нового пользователя');
    
    // Можно также начислить бонус новому пользователю
    // await updateUserCredits(newUserId, 1, 'Бонус за регистрацию по реферальной ссылке');
    
    logger.info(`Referral bonus processed: referrer ${referrerId}, new user ${newUserId}`);
  } catch (error) {
    logger.error('Error processing referral bonus:', error);
  }
}

async function getUserByReferralCode(referralCode) {
  try {
    const { supabase } = require('../database/init');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('referral_code', referralCode)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    logger.error('Error getting user by referral code:', error);
    return null;
  }
}

module.exports = {
  handleStart
}; 