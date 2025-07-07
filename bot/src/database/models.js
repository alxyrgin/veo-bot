const { supabase } = require('./init');
const logger = require('../utils/logger');

/**
 * Модели для работы с базой данных
 */

// ===== ПОЛЬЗОВАТЕЛИ =====

/**
 * Создание нового пользователя
 */
async function createUser(telegramId, username, firstName, referredBy = null) {
  try {
    const userData = {
      telegram_id: telegramId,
      username,
      first_name: firstName,
      referred_by: referredBy
    };

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;

    logger.info('User created:', { telegram_id: telegramId, id: data.id });
    return data;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Получение пользователя по Telegram ID
 */
async function getUserByTelegramId(telegramId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    logger.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Обновление кредитов пользователя
 */
async function updateUserCredits(userId, creditsChange, description = '') {
  try {
    // Сначала получаем текущее количество кредитов
    const { data: currentUser, error: getUserError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (getUserError) throw getUserError;

    const newCredits = currentUser.credits + creditsChange;
    
    if (newCredits < 0) {
      throw new Error('Insufficient credits');
    }

    // Обновляем кредиты пользователя
    const { data, error } = await supabase
      .from('users')
      .update({ 
        credits: newCredits,
        last_active: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Записываем транзакцию
    await createTransaction({
      user_id: userId,
      type: creditsChange > 0 ? 'referral' : 'generation',
      credits_change: creditsChange,
      description
    });

    logger.info('User credits updated:', { 
      user_id: userId, 
      credits_change: creditsChange,
      new_balance: newCredits
    });

    return data;
  } catch (error) {
    logger.error('Error updating user credits:', error);
    throw error;
  }
}

/**
 * Обновление счетчика сгенерированных видео
 */
async function incrementUserVideoCount(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        total_videos_generated: supabase.raw('total_videos_generated + 1'),
        last_active: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    logger.info('User video count incremented:', { user_id: userId });
    return data;
  } catch (error) {
    logger.error('Error incrementing video count:', error);
    throw error;
  }
}

// ===== ТРАНЗАКЦИИ =====

/**
 * Создание транзакции
 */
async function createTransaction(transactionData) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) throw error;

    logger.info('Transaction created:', { 
      id: data.id, 
      type: data.type,
      credits_change: data.credits_change
    });

    return data;
  } catch (error) {
    logger.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Получение истории транзакций пользователя
 */
async function getUserTransactions(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error getting user transactions:', error);
    throw error;
  }
}

// ===== ГЕНЕРАЦИИ ВИДЕО =====

/**
 * Создание записи о генерации видео
 */
async function createVideoGeneration(generationData) {
  try {
    const { data, error } = await supabase
      .from('video_generations')
      .insert(generationData)
      .select()
      .single();

    if (error) throw error;

    logger.info('Video generation created:', { 
      id: data.id, 
      user_id: data.user_id,
      video_type: data.video_type
    });

    return data;
  } catch (error) {
    logger.error('Error creating video generation:', error);
    throw error;
  }
}

/**
 * Обновление статуса генерации видео
 */
async function updateVideoGeneration(generationId, updates) {
  try {
    const { data, error } = await supabase
      .from('video_generations')
      .update(updates)
      .eq('id', generationId)
      .select()
      .single();

    if (error) throw error;

    logger.info('Video generation updated:', { 
      id: generationId, 
      status: updates.status
    });

    return data;
  } catch (error) {
    logger.error('Error updating video generation:', error);
    throw error;
  }
}

/**
 * Получение истории генераций пользователя
 */
async function getUserVideoGenerations(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('video_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error getting user video generations:', error);
    throw error;
  }
}

/**
 * Получение статистики для админ-панели
 */
async function getAdminStats() {
  try {
    // Общая статистика пользователей
    const { data: userStats, error: userError } = await supabase
      .from('users')
      .select('id, created_at, credits, total_videos_generated');

    if (userError) throw userError;

    // Статистика транзакций
    const { data: transactionStats, error: transactionError } = await supabase
      .from('transactions')
      .select('type, credits_change, amount_rub, created_at');

    if (transactionError) throw transactionError;

    // Статистика генераций
    const { data: generationStats, error: generationError } = await supabase
      .from('video_generations')
      .select('status, video_type, credits_used, created_at');

    if (generationError) throw generationError;

    return {
      users: userStats || [],
      transactions: transactionStats || [],
      generations: generationStats || []
    };
  } catch (error) {
    logger.error('Error getting admin stats:', error);
    throw error;
  }
}

module.exports = {
  // Пользователи
  createUser,
  getUserByTelegramId,
  updateUserCredits,
  incrementUserVideoCount,
  
  // Транзакции
  createTransaction,
  getUserTransactions,
  
  // Генерации видео
  createVideoGeneration,
  updateVideoGeneration,
  getUserVideoGenerations,
  
  // Админ
  getAdminStats
}; 