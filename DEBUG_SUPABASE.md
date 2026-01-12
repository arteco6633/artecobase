# Отладка проблемы с Supabase

Если данные не сохраняются в Supabase, проверьте следующее:

## 1. Проверьте консоль браузера

1. Откройте DevTools (F12 или Cmd+Option+I)
2. Перейдите на вкладку **Console**
3. Попробуйте создать таблицу
4. Проверьте, есть ли ошибки (красные сообщения)

## 2. Проверьте вкладку Network

1. В DevTools перейдите на вкладку **Network**
2. Попробуйте создать таблицу
3. Найдите запрос к Supabase (обычно содержит `supabase.co`)
4. Откройте его и проверьте:
   - Status код (должен быть 200 или 201)
   - Response (что вернул сервер)
   - Request payload (что отправили)

## 3. Проверьте RLS политики в Supabase

1. Откройте Supabase Dashboard
2. Перейдите в **Table Editor** → **documents**
3. Нажмите на кнопку "1 RLS policy" (или проверьте в SQL Editor)
4. Убедитесь, что политика существует и разрешает все операции

Если политики нет, выполните в SQL Editor:

```sql
CREATE POLICY "Enable all operations for all users" ON documents
FOR ALL USING (true) WITH CHECK (true);
```

## 4. Проверьте переменные окружения

Убедитесь, что в `.env` файле правильные значения:

```
VITE_SUPABASE_URL=https://oojntidzikkhaivfdnee.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DlOloCqUzx_iBgf-BypWzQ_G-kDl4Ji
```

После изменения `.env` файла нужно перезапустить dev-сервер.

## 5. Проверьте структуру таблицы

В Supabase SQL Editor выполните:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents';
```

Убедитесь, что все необходимые колонки существуют.

## 6. Попробуйте вставить данные напрямую в SQL Editor

```sql
INSERT INTO documents (name, category, type, content, tags, shareable)
VALUES (
  'Тестовая таблица',
  'materials',
  'table',
  '{"columns": ["Колонка 1"], "rows": []}'::jsonb,
  ARRAY[]::text[],
  true
);
```

Если это работает, значит проблема в коде приложения или RLS политиках.
