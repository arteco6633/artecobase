# Настройка Supabase для ArtecoBase

## Шаг 1: Создание проекта в Supabase

1. Перейдите на https://supabase.com
2. Войдите или зарегистрируйтесь (можно через GitHub)
3. Нажмите "New Project"
4. Заполните форму:
   - **Name**: artecobase (или другое название)
   - **Database Password**: придумайте надежный пароль (сохраните его!)
   - **Region**: выберите ближайший регион
5. Нажмите "Create new project" (создание займет 1-2 минуты)

## Шаг 2: Получение API ключей

1. В панели проекта перейдите в **Settings** → **API**
2. Скопируйте следующие значения:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** key (публичный ключ)

## Шаг 3: Создание таблиц в базе данных

1. В панели проекта перейдите в **SQL Editor**
2. Выполните следующий SQL скрипт для создания таблиц:

```sql
-- Таблица для документов (таблицы и текстовые документы)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('materials', 'furniture', 'order-forms', 'production', 'other')),
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('table', 'document')),
  content JSONB, -- для таблиц: {columns: [], rows: []}, для документов: {text: ""}
  tags TEXT[] DEFAULT '{}',
  shareable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Политика: разрешаем всем читать и писать (для начала)
-- В продакшене нужно будет настроить аутентификацию
CREATE POLICY "Enable all operations for all users" ON documents
FOR ALL USING (true) WITH CHECK (true);
```

## Шаг 4: Настройка переменных окружения

1. Создайте файл `.env` в корне проекта (на основе `.env.example`)
2. Заполните значения:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Важно:** 
- Не коммитьте файл `.env` в Git (он уже в .gitignore)
- Добавьте эти же переменные в настройках Vercel (Settings → Environment Variables)

## Шаг 5: Установка зависимостей

После того, как я обновлю код, выполните:

```bash
npm install
```

## Дополнительные настройки для продакшена

### Настройка RLS (Row Level Security)

После добавления аутентификации пользователей, нужно будет:

1. Создать таблицу пользователей или использовать встроенную auth.users
2. Обновить политики RLS для доступа только авторизованным пользователям
3. Добавить поля `user_id` в таблицу documents для привязки к пользователю

Пример политики с аутентификацией:

```sql
-- Удаляем старую политику
DROP POLICY "Enable all operations for all users" ON documents;

-- Добавляем поле user_id (если нужно)
ALTER TABLE documents ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Политика: пользователи видят только свои документы
CREATE POLICY "Users can view own documents" ON documents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
FOR DELETE USING (auth.uid() = user_id);
```

## Проверка подключения

После настройки вы сможете:
1. Запустить приложение: `npm run dev`
2. Создать таблицу или документ
3. Проверить в Supabase Dashboard → Table Editor, что данные сохраняются
