# Устранение проблем с API route на Vercel

## Проблема: 404 ошибка

### Возможные причины

1. **Vercel не распознал файл как API route**
   - Проверьте структуру: файл должен быть в `api/sync-availability.ts`
   - Убедитесь, что файл в репозитории

2. **Ошибка компиляции TypeScript**
   - Проверьте логи деплоя в Vercel Dashboard
   - Убедитесь, что нет ошибок TypeScript

3. **Нужен передеплой**
   - Возможно, функция не задеплоилась с последним коммитом
   - Попробуйте сделать новый деплой

### Решения

#### Вариант 1: Проверить логи деплоя

1. Vercel Dashboard → Deployments
2. Откройте последний деплой
3. Проверьте логи на ошибки
4. Проверьте раздел "Functions" - должна быть `api/sync-availability`

#### Вариант 2: Переименовать в .js (временное решение)

Если TypeScript не работает, можно переименовать в `.js`:
```bash
mv api/sync-availability.ts api/sync-availability.js
```

Но тогда нужно убрать типы TypeScript.

#### Вариант 3: Использовать другой формат

Vercel поддерживает несколько форматов для API routes:
- `api/sync-availability.ts` (TypeScript)
- `api/sync-availability.js` (JavaScript)
- `api/sync-availability/index.ts` (папка с index файлом)

### Проверка структуры

Убедитесь, что структура правильная:
```
artecobase/
  api/
    sync-availability.ts  ← должен быть здесь
  src/
  ...
```

### Проверка в Vercel Dashboard

1. Перейдите в проект → Functions
2. Должна быть функция `api/sync-availability`
3. Если нет - значит Vercel не распознал файл
