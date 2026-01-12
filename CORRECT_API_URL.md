# Правильный URL для API функции

## Ваш проект

URL проекта: **https://artecobase.vercel.app/**

## URL API функции

Правильный URL для синхронизации наличия:
```
https://artecobase.vercel.app/api/sync-availability
```

## Тестирование

Можно протестировать через:
1. Браузер: https://artecobase.vercel.app/api/sync-availability
2. curl:
```bash
curl -X POST https://artecobase.vercel.app/api/sync-availability
```

## Если все еще 404

Проверьте в Vercel Dashboard:
1. Deployments → последний деплой → Functions
2. Должна быть функция `api/sync-availability`
3. Если нет - возможно нужно перезадеплоить
