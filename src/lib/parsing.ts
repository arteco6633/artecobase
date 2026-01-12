/**
 * Функции для парсинга данных с сайта dreviz-shop.ru
 */

export interface ParsedMaterial {
  article: string; // Артикул (например, "00-00034625", "ИП040073")
  texture: string | null; // Тиснение (PR, PE, MP, SM, TS, LF и т.д.)
  thickness: string | null; // Толщина (16, 18 и т.д.)
  name: string; // Наименование материала
  brand: string | null; // Бренд (например, "Увадрев")
  size: string | null; // Размеры (например, "2750*1830*16")
  availability: number; // Наличие (количество)
  price: number | null; // Цена
  sourceUrl: string; // URL на сайте источника
}

/**
 * Извлекает тиснение из названия материала
 * Тиснение обычно находится в конце названия (PR, PE, MP, SM, TS, LF и т.д.)
 */
function extractTexture(name: string): string | null {
  // Паттерны тиснений (обычно 2-3 заглавные буквы в конце)
  const texturePattern = /\b([A-ZА-Я]{2,3})\s*$/;
  const match = name.match(texturePattern);
  return match ? match[1] : null;
}

/**
 * Извлекает толщину из названия или размеров
 * Обычно формат: "2750*1830*16" или "16 мм"
 */
function extractThickness(name: string, size: string | null): string | null {
  // Ищем толщину в размерах (последнее число, обычно 16, 18, 22)
  if (size) {
    const sizeMatch = size.match(/\*(\d+)$/);
    if (sizeMatch) {
      return sizeMatch[1];
    }
  }
  
  // Ищем в названии
  const thicknessMatch = name.match(/\b(\d{2})\s*(?:мм|mm)?\b/);
  return thicknessMatch ? thicknessMatch[1] : null;
}

/**
 * Извлекает размеры из названия материала
 * Формат: "2750*1830*16"
 */
function extractSize(name: string): string | null {
  const sizePattern = /\b(\d+\*\d+\*\d+)\b/;
  const match = name.match(sizePattern);
  return match ? match[1] : null;
}

/**
 * Извлекает бренд из названия
 * Обычно первое слово после "ЛДСП"
 */
function extractBrand(name: string): string | null {
  const brandMatch = name.match(/ЛДСП\s+([А-ЯЁ][а-яё]+)/);
  return brandMatch ? brandMatch[1] : null;
}

/**
 * Парсит строку с ценой и возвращает число
 * "3 440,00" -> 3440.00
 */
function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;
  
  // Убираем пробелы и заменяем запятую на точку
  const cleaned = priceStr.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Парсит данные материала из HTML строки таблицы или объекта API
 * 
 * @param rawData - Сырые данные (объект из API или HTML строка)
 * @returns Парсенный материал или null, если не удалось распарсить
 */
export function parseMaterial(rawData: any): ParsedMaterial | null {
  try {
    // Если это объект из API
    if (typeof rawData === 'object' && rawData !== null) {
      const name = rawData.name || rawData.title || '';
      const article = rawData.article || rawData.code || '';
      const availability = parseInt(rawData.availability || rawData.stock || '0', 10) || 0;
      const priceStr = rawData.price || rawData.priceFormatted || '';
      const price = parsePrice(priceStr);
      const url = rawData.url || rawData.link || '';
      
      const size = extractSize(name) || rawData.size || null;
      const texture = extractTexture(name) || rawData.texture || null;
      const thickness = extractThickness(name, size) || rawData.thickness || null;
      const brand = extractBrand(name) || rawData.brand || null;
      
      if (!article || !name) {
        return null;
      }
      
      return {
        article,
        texture,
        thickness,
        name,
        brand,
        size,
        availability,
        price,
        sourceUrl: url,
      };
    }
    
    // Если это строка HTML (для будущего использования)
    // Можно добавить парсинг через cheerio или регулярные выражения
    
    return null;
  } catch (error) {
    console.error('Ошибка парсинга материала:', error);
    return null;
  }
}

/**
 * Парсит несколько материалов
 */
export function parseMaterials(rawDataArray: any[]): ParsedMaterial[] {
  const materials: ParsedMaterial[] = [];
  
  for (const item of rawDataArray) {
    const material = parseMaterial(item);
    if (material) {
      materials.push(material);
    }
  }
  
  return materials;
}
