# Vercel Function создана! ✅

## Что готово

1. ✅ **API Route**: `api/sync-availability.ts`
   - Использует Puppeteer для парсинга JavaScript-сайта
   - Синхронизирует только наличие (availability)
   - Обновляет `last_synced_at`

2. ✅ **Зависимости установлены**:
   - `puppeteer-core` - для headless browser
   - `@sparticuz/chromium` - Chromium для Vercel
   - `@vercel/node` - типы для Vercel Functions

3. ✅ **Код компилируется** без ошибок

## Что нужно сделать СЕЙЧАС

### 1. Добавить переменные окружения в Vercel

**КРИТИЧЕСКИ ВАЖНО:** Нужен Service Role Key!

1. Получите Service Role Key:
   - https://supabase.com/dashboard/project/oojntidzikkhaivfdnee/settings/api
   - Скопируйте `service_role` key (секретный ключ)

2. В Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL` = `https://oojntidzikkhaivfdnee.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (ваш service_role key)

### 2. Убедиться, что таблица materials создана

Выполните скрипт `database_materials.sql` в Supabase, если еще не сделали.

### 3. Деплой

После push в GitHub Vercel автоматически задеплоит.

### 4. Тестирование

Вызовите функцию:
```
https://your-project.vercel.app/api/sync-availability
```

## Что делает функция

1. Открывает сайт dreviz-shop.ru через Puppeteer
2. Ждет загрузки таблицы (до 10 секунд)
3. Извлекает артикул и наличие из каждой строки
4. Обновляет поле `availability` в таблице `materials` по артикулу
5. Обновляет `last_synced_at`

## Ограничения

- Парсит только первую страницу (20 товаров)
- Обновляет по артикулу (не по артикул+тиснение+толщина)

## Следующие шаги после тестирования

1. Добавить пагинацию (если нужно больше материалов)
2. Добавить UI для ручного запуска
3. Настроить автоматическое обновление через Vercel Cron
