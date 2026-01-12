/**
 * Временная функция для тестирования парсинга наличия материалов
 * Можно вызывать из браузера для проверки
 */

export interface AvailabilityData {
  article: string;
  availability: number;
  name?: string;
}

/**
 * Тестовая функция для парсинга наличия с одной страницы
 * Вызывается из браузера через консоль
 */
export async function testParseAvailability(): Promise<AvailabilityData[]> {
  const url = 'https://dreviz-shop.ru/products?criteria[section]=524&criteria[group]=54e8acc9-d20c-11e6-80d9-00155d006309&criteria[features][25411cc9-33c7-11e6-80d5-00155d006309][]=25411cd1-33c7-11e6-80d5-00155d006309&page=1';
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Простой парсинг через регулярные выражения
    // Ищем строки таблицы
    const materials: AvailabilityData[] = [];
    
    // Паттерн для строки таблицы с данными (упрощенный)
    // В реальности нужен более точный парсинг
    const rowPattern = /<tr[^>]*>.*?<\/tr>/gs;
    const rows = html.match(rowPattern) || [];
    
    for (const row of rows.slice(0, 20)) { // Первые 20 строк
      // Извлекаем артикул (первая колонка)
      const articleMatch = row.match(/<td[^>]*>([^<]+)<\/td>/);
      if (!articleMatch) continue;
      
      const article = articleMatch[1].trim();
      
      // Извлекаем наличие (обычно 5-я колонка)
      // Это упрощенный вариант - нужно адаптировать под реальную структуру
      const cells = row.match(/<td[^>]*>([^<]+)<\/td>/g) || [];
      if (cells.length < 5) continue;
      
      const availabilityText = cells[4]?.replace(/<[^>]*>/g, '').trim() || '';
      const availability = parseInt(availabilityText.replace(/\D/g, ''), 10) || 0;
      
      if (article && !article.includes('Артикул')) { // Пропускаем заголовок
        materials.push({
          article,
          availability,
        });
      }
    }
    
    return materials;
  } catch (error) {
    console.error('Ошибка парсинга:', error);
    return [];
  }
}

/**
 * Функция для синхронизации наличия материала по артикулу
 */
export async function syncAvailabilityByArticle(_article: string): Promise<number | null> {
  // Здесь будет логика поиска материала на сайте и получения его наличия
  // Пока возвращаем null
  return null;
}
