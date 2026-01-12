# Vercel Function для синхронизации наличия - Готово! ✅

## Что создано

1. ✅ **API Route**: `api/sync-availability.ts`
2. ✅ **Зависимости установлены**: puppeteer-core, @sparticuz/chromium, @vercel/node
3. ✅ **Функция готова к использованию**

## Как использовать

### 1. Настройка переменных окружения в Vercel

1. Откройте Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте:
   - `VITE_SUPABASE_URL` = `https://oojntidzikkhaivfdnee.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (получите из Supabase Dashboard → Settings → API → service_role key)

**Важно:** Service Role Key нужен для записи в таблицу `materials`.

### 2. Деплой

После push в GitHub Vercel автоматически задеплоит функцию.

Или вручную:
```bash
vercel deploy
```

### 3. Вызов функции

**Через API:**
```bash
curl -X POST https://your-project.vercel.app/api/sync-availability
```

**Из фронтенда:**
```typescript
const response = await fetch('/api/sync-availability', {
  method: 'POST',
});
const result = await response.json();
```

## Что делает функция

1. ✅ Открывает сайт dreviz-shop.ru через Puppeteer
2. ✅ Ждет загрузки таблицы
3. ✅ Извлекает артикул и наличие из каждой строки
4. ✅ Обновляет поле `availability` в таблице `materials`
5. ✅ Обновляет `last_synced_at`

## Текущие ограничения

- Парсит только первую страницу (можно добавить пагинацию)
- Обновляет материалы по артикулу (не по артикул+тиснение+толщина)

## Следующие шаги

1. Протестировать функцию после деплоя
2. Добавить UI для ручного запуска
3. Настроить автоматическое обновление через Vercel Cron
