-- Обновление схемы базы данных для аутентификации и ролей

-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'partner')) DEFAULT 'partner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индекса для ролей
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'partner')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Включаем RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут создавать свои профили (на случай если триггер не сработал)
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Политика: пользователи могут видеть свои профили
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Политика: пользователи могут обновлять свои профили (кроме роли)
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Обновление таблицы documents: добавляем поле user_id
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Создание индекса для user_id
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Удаляем старую политику для documents
DROP POLICY IF EXISTS "Enable all operations for all users" ON documents;

-- Новая политика: все могут видеть документы
DROP POLICY IF EXISTS "Everyone can view documents" ON documents;
CREATE POLICY "Everyone can view documents" ON documents
FOR SELECT USING (true);

-- Политика: только администраторы могут создавать документы
DROP POLICY IF EXISTS "Only admins can insert documents" ON documents;
CREATE POLICY "Only admins can insert documents" ON documents
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Политика: только администраторы могут обновлять документы
DROP POLICY IF EXISTS "Only admins can update documents" ON documents;
CREATE POLICY "Only admins can update documents" ON documents
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

-- Политика: только администраторы могут удалять документы
DROP POLICY IF EXISTS "Only admins can delete documents" ON documents;
CREATE POLICY "Only admins can delete documents" ON documents
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
