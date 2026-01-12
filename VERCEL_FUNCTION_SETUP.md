# Настройка Vercel Function для синхронизации наличия

## Что было создано

1. ✅ API route: `api/sync-availability.ts`
2. ✅ Добавлены зависимости: `puppeteer-core`, `@sparticuz/chromium`, `@vercel/node`
3. ✅ Функция использует Puppeteer для парсинга JavaScript-сайта

## Установка зависимостей

```bash
npm install
```

## Настройка переменных окружения

В Vercel Dashboard добавьте переменные:
1. `VITE_SUPABASE_URL` (или `SUPABASE_URL`)
2. `SUPABASE_SERVICE_ROLE_KEY` (для записи в БД)

**Важно:** Для записи в таблицу `materials` нужен Service Role Key, а не Anon Key.

Получить Service Role Key:
1. Supabase Dashboard → Settings → API
2. Скопируйте `service_role` key (секретный ключ)

## Локальное тестирование

Для локального тестирования нужно установить Chrome/Chromium:

```bash
# macOS (через Homebrew)
brew install --cask google-chrome

# Или скачать вручную с https://www.google.com/chrome/
```

Затем:
```bash
npm run dev
```

И вызовите функцию:
```bash
curl http://localhost:5173/api/sync-availability
```

## Деплой на Vercel

После push в GitHub:
1. Vercel автоматически задеплоит функцию
2. Функция будет доступна по адресу: `https://your-project.vercel.app/api/sync-availability`

## Использование

### Вызов через API

```bash
curl -X POST https://your-project.vercel.app/api/sync-availability
```

### Из фронтенда

```typescript
const response = await fetch('/api/sync-availability', {
  method: 'POST',
});
const result = await response.json();
console.log(result);
```

## Что делает функция

1. Открывает страницу dreviz-shop.ru через Puppeteer
2. Ждет загрузки таблицы с товарами
3. Извлекает артикул и наличие из каждой строки
4. Обновляет поле `availability` в таблице `materials`
5. Обновляет `last_synced_at`

## Ограничения

- Функция парсит только первую страницу (для теста)
- Можно добавить пагинацию позже
- Максимальное время выполнения: 10 секунд (можно увеличить в настройках Vercel)
