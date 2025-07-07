-- Создание таблицы транзакций
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'generation', 'referral')),
  credits_change INTEGER NOT NULL, -- положительное значение для начисления, отрицательное для списания
  amount_rub DECIMAL(10,2), -- сумма в рублях для покупок
  telegram_payment_id TEXT, -- ID платежа из Telegram
  description TEXT, -- описание транзакции
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_telegram_payment_id ON transactions(telegram_payment_id);

-- Комментарии к полям
COMMENT ON TABLE transactions IS 'Таблица транзакций (покупки, генерации, рефералы)';
COMMENT ON COLUMN transactions.type IS 'Тип транзакции: purchase, generation, referral';
COMMENT ON COLUMN transactions.credits_change IS 'Изменение кредитов: + для начисления, - для списания';
COMMENT ON COLUMN transactions.amount_rub IS 'Сумма платежа в рублях';
COMMENT ON COLUMN transactions.telegram_payment_id IS 'ID платежа из Telegram Payments'; 