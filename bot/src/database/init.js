const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    // Проверяем подключение к базе данных
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
    
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

module.exports = {
  supabase,
  initializeDatabase
}; 