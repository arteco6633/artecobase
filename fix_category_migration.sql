-- Исправление миграции категорий
-- Этот скрипт исправляет проблему с полем category

-- Сначала убеждаемся, что category_id существует
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Создаем индекс если его нет
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);

-- Делаем category_id NOT NULL только если в нем нет NULL значений
-- Сначала обновляем все NULL значения на категорию по умолчанию
DO $$
DECLARE
  default_category_id UUID;
BEGIN
  -- Находим ID категории "Прочее" или создаем её
  SELECT id INTO default_category_id FROM categories WHERE name = 'Прочее' LIMIT 1;
  
  IF default_category_id IS NULL THEN
    -- Если категории "Прочее" нет, берем первую доступную
    SELECT id INTO default_category_id FROM categories LIMIT 1;
  END IF;
  
  -- Обновляем все NULL значения category_id
  IF default_category_id IS NOT NULL THEN
    UPDATE documents SET category_id = default_category_id WHERE category_id IS NULL;
  END IF;
END $$;

-- Удаляем старое поле category, если оно существует
-- Сначала проверяем, существует ли колонка
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE documents DROP COLUMN category;
  END IF;
END $$;
