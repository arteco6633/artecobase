# Тестирование синхронизации наличия - СЕЙЧАС

## Текущая ситуация

1. ✅ Edge Function создана
2. ⚠️ Сайт требует JavaScript для рендеринга (не работает простой HTML парсинг)
3. ⚠️ API требует авторизацию

## Вопрос для начала

**У вас уже есть материалы в таблице `materials`?**

- Если ДА → функция обновит их наличие
- Если НЕТ → сначала нужно добавить материалы

## Быстрое тестирование

### Вариант 1: Через Supabase Dashboard (рекомендуется)

1. Откройте: https://supabase.com/dashboard/project/oojntidzikkhaivfdnee/edge-functions
2. Нажмите "Create a new function"
3. Название: `sync-availability`
4. Скопируйте код из `supabase/functions/parse-materials/index.ts`
5. Задеплойте
6. Вызовите функцию

### Вариант 2: Установить CLI (если нужно)

```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref oojntidzikkhaivfdnee
supabase functions deploy parse-materials
```

## ⚠️ Важно

Текущая функция использует простой HTML парсинг, который **не сработает** для сайта с JavaScript.

Для реальной работы нужен headless browser (Puppeteer/Playwright), что требует:
- Node.js (не Deno)
- Или внешний сервис для рендеринга

## Альтернативное решение

Для работы с JavaScript-сайтом лучше использовать:
- **Vercel Functions** (Node.js + Puppeteer)
- Или **внешний сервис** (Browserless.io, ScrapingBee)

Хотите, чтобы я создал решение через Vercel Functions?
