-- Расширение базы данных для хранения информации о материалах и наличии

-- Создание таблицы для материалов (если нужно отдельное хранение)
-- Или можно расширить существующую структуру документов

-- Вариант 1: Отдельная таблица материалов
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article TEXT NOT NULL, -- Артикул (например, 00-00034625, ИП040073)
  texture TEXT, -- Тиснение (PR, PE, MP, SM, TS, LF и т.д.)
  thickness TEXT, -- Толщина (16, 18 и т.д.)
  name TEXT NOT NULL, -- Наименование материала
  brand TEXT, -- Бренд (например, Увадрев)
  size TEXT, -- Размеры (например, 2750*1830*16)
  availability INT DEFAULT 0, -- Наличие (количество)
  price DECIMAL(10, 2), -- Цена
  last_synced_at TIMESTAMP WITH TIME ZONE, -- Дата последней синхронизации
  source_url TEXT, -- URL на сайте источника
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Индексы для быстрого поиска
  UNIQUE(article, texture, thickness) -- Уникальная комбинация
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_materials_article ON materials(article);
CREATE INDEX IF NOT EXISTS idx_materials_texture ON materials(texture);
CREATE INDEX IF NOT EXISTS idx_materials_availability ON materials(availability);
CREATE INDEX IF NOT EXISTS idx_materials_last_synced ON materials(last_synced_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
FOR EACH ROW EXECUTE FUNCTION update_materials_updated_at();

-- Включаем RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Политика: все могут видеть материалы
DROP POLICY IF EXISTS "Everyone can view materials" ON materials;
CREATE POLICY "Everyone can view materials" ON materials
FOR SELECT USING (true);

-- Политика: только администраторы могут изменять материалы
DROP POLICY IF EXISTS "Only admins can manage materials" ON materials;
CREATE POLICY "Only admins can manage materials" ON materials
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Вариант 2: Добавить поля в существующую таблицу documents (если материалы хранятся там)
-- Это зависит от того, как вы хотите организовать данные

-- Таблица для истории изменений наличия (опционально)
CREATE TABLE IF NOT EXISTS materials_availability_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  availability INT NOT NULL,
  price DECIMAL(10, 2),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT -- Откуда пришли данные
);

CREATE INDEX IF NOT EXISTS idx_availability_history_material_id ON materials_availability_history(material_id);
CREATE INDEX IF NOT EXISTS idx_availability_history_changed_at ON materials_availability_history(changed_at);

-- RLS для истории
ALTER TABLE materials_availability_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view availability history" ON materials_availability_history;
CREATE POLICY "Everyone can view availability history" ON materials_availability_history
FOR SELECT USING (true);
