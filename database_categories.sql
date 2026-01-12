-- Создание таблицы категорий с поддержкой иерархии

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT 'blue',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_categories_updated_at();

-- Включаем RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Политика: все могут просматривать категории
DROP POLICY IF EXISTS "Everyone can view categories" ON categories;
CREATE POLICY "Everyone can view categories" ON categories
FOR SELECT USING (true);

-- Политика: только администраторы могут создавать категории
DROP POLICY IF EXISTS "Only admins can insert categories" ON categories;
CREATE POLICY "Only admins can insert categories" ON categories
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Политика: только администраторы могут обновлять категории
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
CREATE POLICY "Only admins can update categories" ON categories
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Политика: только администраторы могут удалять категории
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
CREATE POLICY "Only admins can delete categories" ON categories
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Изменение таблицы documents: замена category на category_id
-- Сначала создаем новую колонку
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Создаем индекс
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);

-- Миграция данных: создаем категории из старых значений и обновляем документы
-- Создаем категории на основе старых значений (только если их еще нет)
DO $$
BEGIN
  INSERT INTO categories (name, icon, color, position)
  SELECT 'Материалы', 'package', 'blue', 1
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Материалы');
  
  INSERT INTO categories (name, icon, color, position)
  SELECT 'Фурнитура', 'wrench', 'green', 2
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Фурнитура');
  
  INSERT INTO categories (name, icon, color, position)
  SELECT 'Бланки заказа', 'file-text', 'purple', 3
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Бланки заказа');
  
  INSERT INTO categories (name, icon, color, position)
  SELECT 'Производство', 'factory', 'orange', 4
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Производство');
  
  INSERT INTO categories (name, icon, color, position)
  SELECT 'Прочее', 'folder', 'gray', 5
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Прочее');
END $$;

-- Обновляем документы: связываем со старыми категориями
DO $$
DECLARE
  cat_materials UUID;
  cat_furniture UUID;
  cat_order_forms UUID;
  cat_production UUID;
  cat_other UUID;
BEGIN
  -- Получаем ID категорий
  SELECT id INTO cat_materials FROM categories WHERE name = 'Материалы' LIMIT 1;
  SELECT id INTO cat_furniture FROM categories WHERE name = 'Фурнитура' LIMIT 1;
  SELECT id INTO cat_order_forms FROM categories WHERE name = 'Бланки заказа' LIMIT 1;
  SELECT id INTO cat_production FROM categories WHERE name = 'Производство' LIMIT 1;
  SELECT id INTO cat_other FROM categories WHERE name = 'Прочее' LIMIT 1;
  
  -- Обновляем документы
  UPDATE documents SET category_id = cat_materials WHERE category = 'materials' AND category_id IS NULL;
  UPDATE documents SET category_id = cat_furniture WHERE category = 'furniture' AND category_id IS NULL;
  UPDATE documents SET category_id = cat_order_forms WHERE category = 'order-forms' AND category_id IS NULL;
  UPDATE documents SET category_id = cat_production WHERE category = 'production' AND category_id IS NULL;
  UPDATE documents SET category_id = cat_other WHERE category = 'other' AND category_id IS NULL;
END $$;

-- Старую колонку category можно оставить для обратной совместимости
-- или удалить позже, когда убедимся что все работает
-- ALTER TABLE documents DROP COLUMN IF EXISTS category;
