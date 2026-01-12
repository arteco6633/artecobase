# Тестирование синхронизации наличия

## Цель

Протестировать функцию синхронизации наличия материалов с сайта dreviz-shop.ru.

## Важно

Функция синхронизирует **только наличие** (availability) для материалов, которые уже есть в базе данных.

## Подготовка

Перед тестированием убедитесь, что:
1. Таблица `materials` создана в Supabase
2. В таблице есть материалы с артикулами

## Быстрое тестирование (без CLI)

Если Supabase CLI не установлен, можно протестировать функцию через Dashboard:

1. Откройте Supabase Dashboard: https://supabase.com/dashboard/project/oojntidzikkhaivfdnee
2. Перейдите в **Edge Functions**
3. Создайте новую функцию `parse-materials`
4. Скопируйте код из `supabase/functions/parse-materials/index.ts`
5. Задеплойте функцию
6. Вызовите функцию через Dashboard или API

## Тестирование через API

После деплоя функции можно вызвать её через API:

```bash
curl -X POST 'https://oojntidzikkhaivfdnee.supabase.co/functions/v1/parse-materials' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## Ожидаемый результат

Функция должна:
1. Найти материалы на сайте dreviz-shop.ru
2. Обновить поле `availability` в таблице `materials`
3. Обновить `last_synced_at`

## Проверка результатов

После выполнения функции проверьте в Supabase Dashboard:
1. Откройте **Table Editor** → **materials**
2. Проверьте, что поле `availability` обновлено
3. Проверьте `last_synced_at`
