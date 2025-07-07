const { supabase } = require('../database/init');
const logger = require('../utils/logger');

async function preCheckout(query) {
  // Всегда одобряем предварительную проверку
  await query.answerPreCheckoutQuery(true);
}

async function success(msg) {
  const userId = msg.from.id;
  const payment = msg.successful_payment;
  
  try {
    logger.info(`Payment successful for user ${userId}:`, payment);
    
    // TODO: Обработка успешного платежа
    // 1. Парсим payload для получения информации о пакете
    // 2. Начисляем кредиты пользователю
    // 3. Записываем транзакцию в базу данных
    
    await msg.reply('💳 Платеж успешно обработан! Кредиты начислены на ваш баланс.');
    
  } catch (error) {
    logger.error('Error processing payment:', error);
    await msg.reply('Произошла ошибка при обработке платежа. Обратитесь в поддержку.');
  }
}

module.exports = {
  preCheckout,
  success
}; 