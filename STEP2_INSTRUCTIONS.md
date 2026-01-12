# Шаг 2: Создание Edge Function - Пошаговая инструкция

## Что нужно сделать

### 1. Установить Supabase CLI

Выберите способ установки:

**macOS (через Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Или через npm:**
```bash
npm install -g supabase
```

**Проверка:**
```bash
supabase --version
```

### 2. Инициализировать Supabase в проекте

```bash
# Перейдите в директорию проекта
cd "/Users/anastasiashorohova/Desktop/Салават /artecobase"

# Инициализация
supabase init

# Логин в Supabase
supabase login

# Связывание с проектом (используйте ваш project ref)
supabase link --project-ref oojntidzikkhaivfdnee
```

### 3. Создать Edge Function

```bash
supabase functions new parse-materials
```

Это создаст структуру `supabase/functions/parse-materials/index.ts`

### 4. Заменить содержимое index.ts

Я уже создал файл `supabase/functions/parse-materials/index.ts` с базовой реализацией.
После создания функции через CLI, скопируйте содержимое из созданного файла.

### 5. Локальное тестирование (опционально)

```bash
# Запустить локальный сервер
supabase start

# Вызвать функцию локально
curl -i --location --request POST 'http://localhost:54321/functions/v1/parse-materials' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### 6. Деплой функции

```bash
# Деплой на Supabase
supabase functions deploy parse-materials
```

### 7. Настройка переменных окружения

В Supabase Dashboard:
1. Перейдите в **Edge Functions** → **parse-materials**
2. Добавьте переменные окружения (если нужно)

## ⚠️ Важно

Эта функция использует простой HTTP парсинг HTML. Если сайт требует JavaScript для рендеринга данных, этот подход может не сработать.

В этом случае нужно будет:
- Использовать Vercel Functions (Node.js + Puppeteer)
- Или использовать внешний сервис для рендеринга

## Следующие шаги

После создания функции:
1. Протестировать её работу
2. Настроить автоматический запуск через Cron
3. Создать UI для ручного запуска
