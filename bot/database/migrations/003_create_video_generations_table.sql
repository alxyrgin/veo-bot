-- Создание таблицы генераций видео
CREATE TABLE video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt_original TEXT NOT NULL, -- оригинальный промпт пользователя
  prompt_enhanced TEXT NOT NULL, -- улучшенный промпт для VEO 3
  video_type TEXT NOT NULL CHECK (video_type IN ('fast', 'premium')),
  credits_used INTEGER NOT NULL,
  file_url TEXT, -- URL сгенерированного видео
  file_size_mb DECIMAL(10,2), -- размер файла в МБ
  duration_seconds INTEGER, -- длительность видео в секундах
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  error_message TEXT, -- сообщение об ошибке, если генерация не удалась
  veo_generation_id TEXT, -- ID генерации в VEO 3 API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_video_generations_user_id ON video_generations(user_id);
CREATE INDEX idx_video_generations_status ON video_generations(status);
CREATE INDEX idx_video_generations_created_at ON video_generations(created_at);
CREATE INDEX idx_video_generations_veo_id ON video_generations(veo_generation_id);

-- Комментарии к полям
COMMENT ON TABLE video_generations IS 'Таблица генераций видео с помощью VEO 3';
COMMENT ON COLUMN video_generations.prompt_original IS 'Оригинальный промпт пользователя';
COMMENT ON COLUMN video_generations.prompt_enhanced IS 'Улучшенный промпт для VEO 3';
COMMENT ON COLUMN video_generations.video_type IS 'Тип генерации: fast (5 сек) или premium (8 сек)';
COMMENT ON COLUMN video_generations.status IS 'Статус генерации: processing, completed, failed';
COMMENT ON COLUMN video_generations.veo_generation_id IS 'ID генерации в VEO 3 API'; 