# Настройка Supabase Edge Function для парсинга

## Что такое Edge Functions?

Supabase Edge Functions - это серверные функции, которые работают на Deno runtime. Они позволяют:
- Выполнять серверную логику
- Обходить CORS ограничения
- Запускаться по расписанию (через Cron)

## Установка Supabase CLI

Для работы с Edge Functions нужно установить Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# Или через npm
npm install -g supabase
```

## Инициализация проекта

После установки CLI:

```bash
# Инициализация Supabase в проекте
supabase init

# Логин в Supabase
supabase login

# Связывание с проектом
supabase link --project-ref oojntidzikkhaivfdnee
```

## Создание Edge Function

```bash
# Создать новую функцию
supabase functions new parse-materials
```

## Структура Edge Function

Edge Functions находятся в `supabase/functions/`:
```
supabase/
  functions/
    parse-materials/
      index.ts
```

## Ограничения Deno

Edge Functions работают на Deno, что означает:
- Нет прямого доступа к Node.js библиотекам
- Puppeteer/Playwright требуют Node.js (не работают в Deno)
- Нужны альтернативные решения для headless browser

## Решения для парсинга в Deno

### Вариант 1: Использовать простой HTTP парсинг
- Для статичного HTML (если данные в HTML)
- Использовать встроенный fetch + парсинг

### Вариант 2: Использовать внешний сервис
- Playwright Cloud
- Browserless.io
- ScrapingBee

### Вариант 3: Использовать Vercel Functions
- Vercel Functions работают на Node.js
- Можно использовать Puppeteer/Playwright
- Требует отдельную настройку

## Рекомендация

Для начала попробуем простой HTTP парсинг (если данные доступны в исходном HTML), 
если не сработает - перейдем к внешнему сервису или Vercel Functions.
