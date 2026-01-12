# Как найти реальный URL вашего проекта Vercel

## Шаг 1: Открыть Vercel Dashboard

1. Перейдите на https://vercel.com
2. Войдите в свой аккаунт
3. Найдите проект "artecobase" (или название вашего проекта)

## Шаг 2: Найти URL

В карточке проекта вы увидите URL, например:
- `artecobase.vercel.app`
- `artecobase-git-main-yourusername.vercel.app`
- Или custom domain

## Шаг 3: Использовать правильный URL

Вместо `your-project.vercel.app` используйте реальный URL:
```
https://ваш-реальный-url.vercel.app/api/sync-availability
```

## Если функция все еще не работает

Проверьте:
1. Логи деплоя в Vercel Dashboard → Deployments
2. Убедитесь, что файл `api/sync-availability.ts` есть в репозитории
3. Убедитесь, что деплой завершился успешно
