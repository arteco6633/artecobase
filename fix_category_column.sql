-- Исправление проблемы с полем category
-- Удаляем старое поле category из таблицы documents

-- Удаляем старое поле category, если оно существует
DO $$
BEGIN
  -- Проверяем существование колонки и удаляем её
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'documents' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE documents DROP COLUMN category;
    RAISE NOTICE 'Колонка category удалена';
  ELSE
    RAISE NOTICE 'Колонка category не существует';
  END IF;
END $$;
