# Парсинг материалов с dreviz-shop.ru

## Что было создано

### 1. Функции парсинга (`src/lib/parsing.ts`)
- `parseMaterial()` - парсит один материал из данных API
- `parseMaterials()` - парсит массив материалов
- Функции для извлечения тиснения, толщины, размеров, бренда из названия

### 2. Хук для работы с материалами (`src/hooks/useMaterials.ts`)
- `useMaterials()` - React хук для работы с материалами
- Загрузка материалов из базы данных
- Сохранение и обновление материалов
- Массовая синхронизация
- Поиск по артикулу и тиснению

### 3. Функции синхронизации (`src/lib/syncMaterials.ts`)
- `syncMaterialsFromDreviz()` - основная функция синхронизации
- Поддержка пагинации
- Обработка ошибок
- Сохранение в базу данных

## Использование

### Базовый пример синхронизации

```typescript
import { syncMaterialsFromDreviz } from './lib/syncMaterials';

// Синхронизация материалов
const result = await syncMaterialsFromDreviz({
  maxPages: 5, // Ограничить количество страниц для теста
  onProgress: (page, total) => {
    console.log(`Страница ${page} из ${total}`);
  }
});

console.log(`Синхронизировано: ${result.saved} материалов`);
console.log(`Ошибки: ${result.errors.join(', ')}`);
```

### Использование хука в React компоненте

```typescript
import { useMaterials } from './hooks/useMaterials';

function MaterialsList() {
  const { materials, loading, error, loadMaterials } = useMaterials();

  useEffect(() => {
    loadMaterials();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {materials.map(material => (
        <div key={material.id}>
          {material.article} - {material.name} - Наличие: {material.availability}
        </div>
      ))}
    </div>
  );
}
```

## Важные замечания

### Проблема CORS

Функция синхронизации пытается делать запросы к API dreviz-shop.ru из браузера. Это может не работать из-за политики CORS (Cross-Origin Resource Sharing).

**Варианты решения:**

1. **Supabase Edge Function** (рекомендуется)
   - Серверная логика, нет проблем с CORS
   - Можно настроить cron job для автоматического обновления
   - Требует настройки Supabase CLI

2. **Прокси через ваш backend**
   - Создать API endpoint на вашем сервере
   - Проксировать запросы к dreviz-shop.ru

3. **Browser Extension** (для тестирования)
   - Использовать расширение для обхода CORS (только для разработки)

### Тестирование API

Перед использованием нужно проверить:
1. Доступен ли API без авторизации
2. Какую структуру данных возвращает API
3. Требуются ли специальные заголовки

Можно протестировать в консоли браузера:
```javascript
fetch('https://dreviz-shop.ru/api/search?criteria[section]=524&page=1')
  .then(r => r.json())
  .then(data => console.log(data));
```

## Следующие шаги

1. **Протестировать API** - проверить доступность и структуру данных
2. **Создать UI для синхронизации** - кнопка для ручного запуска синхронизации
3. **Настроить автоматическое обновление** - через Supabase Cron или Vercel Cron
4. **Добавить обработку ошибок** - логирование и уведомления

## Автоматическое обновление

Для ежедневного автоматического обновления рекомендуется:
- Создать Supabase Edge Function
- Настроить Supabase Cron Job (pg_cron)
- Или использовать внешний сервис (например, cron-job.org) для вызова функции
