# Шаг 2: Edge Function создана ✅

## Что было сделано

1. ✅ Создана структура Edge Function
2. ✅ Реализован базовый код парсинга в `supabase/functions/parse-materials/index.ts`
3. ✅ Создана документация по установке и использованию

## Структура файлов

```
supabase/
  functions/
    parse-materials/
      index.ts  ← Реализация функции парсинга
```

## Что дальше?

### Вариант A: Использовать Supabase CLI (рекомендуется)

1. **Установить Supabase CLI:**
   ```bash
   brew install supabase/tap/supabase
   # или
   npm install -g supabase
   ```

2. **Инициализировать проект (если еще не сделано):**
   ```bash
   supabase init
   supabase login
   supabase link --project-ref oojntidzikkhaivfdnee
   ```

3. **Деплой функции:**
   ```bash
   supabase functions deploy parse-materials
   ```

### Вариант B: Деплой через Supabase Dashboard

1. Откройте Supabase Dashboard
2. Перейдите в **Edge Functions**
3. Создайте новую функцию
4. Скопируйте код из `supabase/functions/parse-materials/index.ts`

## Важные замечания

⚠️ **Текущая реализация использует простой HTML парсинг**

Если сайт требует JavaScript для рендеринга (что вероятно для SPA), эта функция может не извлечь данные.

**В этом случае нужно:**
- Использовать Vercel Functions (Node.js + Puppeteer)
- Или использовать внешний сервис для рендеринга

## Следующий шаг

После деплоя функции нужно:
1. Протестировать её работу
2. Если не работает - перейти к альтернативному решению
3. Если работает - настроить автоматический запуск
