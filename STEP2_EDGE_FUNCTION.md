# Шаг 2: Создание Edge Function - Инструкция

## Установка Supabase CLI

Выберите один из способов:

### Вариант 1: Через Homebrew (macOS)
```bash
brew install supabase/tap/supabase
```

### Вариант 2: Через npm
```bash
npm install -g supabase
```

### Проверка установки
```bash
supabase --version
```

## Инициализация проекта

После установки CLI выполните:

```bash
# 1. Инициализация Supabase в проекте
supabase init

# 2. Логин в Supabase
supabase login

# 3. Связывание с вашим проектом
supabase link --project-ref oojntidzikkhaivfdnee
```

## Создание Edge Function

```bash
# Создать новую функцию для парсинга материалов
supabase functions new parse-materials
```

Это создаст структуру:
```
supabase/
  functions/
    parse-materials/
      index.ts
```

## Важные замечания

⚠️ **Ограничения Deno:**
- Edge Functions работают на Deno, не Node.js
- Puppeteer/Playwright не работают в Deno (требуют Node.js)
- Для headless browser нужны альтернативные решения

## Решение для парсинга

Мы будем использовать простой HTTP запрос и парсинг HTML через регулярные выражения или простой парсер.

Если это не сработает (сайт требует JS рендеринг), рассмотрим:
- Vercel Functions (Node.js + Puppeteer)
- Внешний сервис для рендеринга
- Альтернативные подходы
