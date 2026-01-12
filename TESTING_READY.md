# Готово к тестированию! ✅

## Что создано

✅ **Vercel Function**: `api/sync-availability.ts`
- Использует Puppeteer для парсинга JavaScript-сайта
- Синхронизирует только наличие (availability)
- Обновляет поле `last_synced_at`

✅ **Зависимости установлены**
- puppeteer-core
- @sparticuz/chromium (для Vercel)
- @vercel/node

## Что нужно сделать перед тестированием

### 1. Добавить переменные окружения в Vercel

**Важно:** Нужен Service Role Key для записи в БД!

1. Получите Service Role Key:
   - Откройте: https://supabase.com/dashboard/project/oojntidzikkhaivfdnee/settings/api
   - Скопируйте `service_role` key (секретный ключ, НЕ anon key)

2. В Vercel Dashboard:
   - Settings → Environment Variables
   - Добавьте:
     - `VITE_SUPABASE_URL` = `https://oojntidzikkhaivfdnee.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY` = (ваш service_role key)

### 2. Деплой

После push в GitHub Vercel автоматически задеплоит.

Или:
```bash
vercel deploy
```

### 3. Проверка таблицы materials

Перед тестированием убедитесь:
- Таблица `materials` создана (скрипт `database_materials.sql` выполнен)
- В таблице есть материалы с артикулами

## Тестирование

После деплоя вызовите функцию:

```bash
curl -X POST https://your-project.vercel.app/api/sync-availability
```

Или из браузера:
```
https://your-project.vercel.app/api/sync-availability
```

## Ожидаемый результат

Функция должна:
1. Открыть сайт dreviz-shop.ru
2. Найти таблицу с товарами
3. Извлечь артикулы и наличие
4. Обновить наличие в таблице `materials`

## Проверка результатов

В Supabase Dashboard:
1. Table Editor → materials
2. Проверьте поле `availability` - должно быть обновлено
3. Проверьте `last_synced_at` - должна быть текущая дата
