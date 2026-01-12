-- Создание таблицы для документов (таблицы и текстовые документы)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('materials', 'furniture', 'order-forms', 'production', 'other')),
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('table', 'document')),
  content JSONB NOT NULL, -- для таблиц: {columns: [], rows: []}, для документов: {text: ""}
  tags TEXT[] DEFAULT '{}',
  shareable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Политика: разрешаем всем читать и писать (для начала)
-- В продакшене нужно будет настроить аутентификацию
DROP POLICY IF EXISTS "Enable all operations for all users" ON documents;
CREATE POLICY "Enable all operations for all users" ON documents
FOR ALL USING (true) WITH CHECK (true);
