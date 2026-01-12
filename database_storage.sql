-- Настройка Supabase Storage для хранения фото таблиц

-- Создание bucket для фото таблиц
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'table-images',
  'table-images',
  true,
  5242880, -- 5 MB лимит на файл
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Политика для просмотра фото (все могут просматривать)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'table-images');

-- Политика для загрузки фото (только авторизованные пользователи)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'table-images' 
  AND auth.role() = 'authenticated'
);

-- Политика для обновления фото (только авторизованные пользователи)
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'table-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'table-images' 
  AND auth.role() = 'authenticated'
);

-- Политика для удаления фото (только авторизованные пользователи)
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'table-images' 
  AND auth.role() = 'authenticated'
);
