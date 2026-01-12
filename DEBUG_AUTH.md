# Отладка белого экрана после регистрации

## Возможные причины:

1. **Таблица `user_profiles` не создана** - самая вероятная причина
2. **Требуется подтверждение email** - пользователь не авторизуется автоматически
3. **Ошибка JavaScript** - проверьте консоль браузера

## Шаг 1: Проверьте консоль браузера

1. Откройте DevTools (F12 или Cmd+Option+I)
2. Перейдите на вкладку **Console**
3. Попробуйте зарегистрироваться
4. Посмотрите на ошибки (красные сообщения)

## Шаг 2: Проверьте, создана ли таблица user_profiles

1. Откройте Supabase Dashboard
2. Перейдите в **Table Editor**
3. Проверьте, есть ли таблица `user_profiles`

Если таблицы нет, выполните SQL скрипт `database_auth.sql` в SQL Editor.

## Шаг 3: Отключите подтверждение email (для тестирования)

1. В Supabase Dashboard перейдите в **Authentication** → **Settings**
2. Найдите **Enable email confirmations**
3. Отключите его (для разработки)
4. Сохраните изменения

После этого пользователи будут авторизованы сразу после регистрации без подтверждения email.

## Шаг 4: Проверьте RLS политики

Убедитесь, что политики для `user_profiles` позволяют создавать профили:

```sql
-- Проверьте политики
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

## Шаг 5: Проверьте вкладку Network

1. В DevTools перейдите на вкладку **Network**
2. Попробуйте зарегистрироваться
3. Найдите запросы к Supabase
4. Проверьте ответы - есть ли ошибки

## Быстрое решение (если таблица не создана):

Выполните этот SQL в Supabase SQL Editor:

```sql
-- Создание таблицы user_profiles (если не создана)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'partner')) DEFAULT 'partner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Политика для создания профилей
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Политика для просмотра своих профилей
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);
```
