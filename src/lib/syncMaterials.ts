/**
 * Функции для синхронизации материалов с сайтом dreviz-shop.ru
 */

import { supabase } from './supabase';
import { parseMaterials, type ParsedMaterial } from './parsing';

export interface SyncOptions {
  /** URL API для парсинга */
  apiUrl?: string;
  /** Максимальное количество страниц для парсинга (по умолчанию все) */
  maxPages?: number;
  /** Callback для отслеживания прогресса */
  onProgress?: (page: number, total: number) => void;
}

export interface SyncResult {
  success: boolean;
  parsed: number;
  saved: number;
  errors: string[];
}

/**
 * Синхронизация материалов с сайта dreviz-shop.ru
 * 
 * Пытается получить данные через API, если не получается - возвращает ошибку
 * В будущем можно добавить HTML парсинг через headless browser
 */
export async function syncMaterialsFromDreviz(options: SyncOptions = {}): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    parsed: 0,
    saved: 0,
    errors: [],
  };

  try {
    // Базовый URL API для категории ЛДСП
    const baseApiUrl = options.apiUrl || 
      'https://dreviz-shop.ru/api/search?criteria[section]=524&criteria[group]=54e8acc9-d20c-11e6-80d9-00155d006309&criteria[features][25411cc9-33c7-11e6-80d5-00155d006309][]=25411cd1-33c7-11e6-80d5-00155d006309';

    const allMaterials: ParsedMaterial[] = [];
    let currentPage = 1;
    let hasMore = true;
    const maxPages = options.maxPages || 100; // Защита от бесконечного цикла

    // Пробуем получить данные со страницы
    while (hasMore && currentPage <= maxPages) {
      try {
        const url = `${baseApiUrl}&page=${currentPage}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; ArtecoBase/1.0)',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Проверяем структуру ответа
        if (!data || !data.items || !Array.isArray(data.items)) {
          // Если нет items, возможно, это пустой ответ или другая структура
          if (data.items && data.items.length === 0) {
            hasMore = false;
            break;
          }
          throw new Error('Неожиданная структура ответа API');
        }

        // Парсим материалы со страницы
        const pageMaterials = parseMaterials(data.items);
        allMaterials.push(...pageMaterials);
        result.parsed += pageMaterials.length;

        // Проверяем, есть ли ещё страницы
        hasMore = data.hasMore === true && data.items.length > 0;

        // Вызываем callback прогресса
        if (options.onProgress) {
          options.onProgress(currentPage, data.totalPages || currentPage);
        }

        currentPage++;
        
        // Небольшая задержка между запросами, чтобы не нагружать сервер
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        const errorMessage = `Ошибка на странице ${currentPage}: ${error.message}`;
        result.errors.push(errorMessage);
        console.error(errorMessage, error);
        
        // Если ошибка на первой странице, прекращаем попытки
        if (currentPage === 1) {
          throw error;
        }
        
        // На других страницах продолжаем, но с осторожностью
        hasMore = false;
      }
    }

    // Сохраняем материалы в базу данных
    if (allMaterials.length > 0) {
      const savedCount = await saveMaterialsToDatabase(allMaterials);
      result.saved = savedCount;
      result.success = true;
    } else {
      result.errors.push('Не удалось получить материалы с сайта');
    }

    return result;
  } catch (error: any) {
    result.errors.push(`Критическая ошибка: ${error.message}`);
    console.error('Ошибка синхронизации материалов:', error);
    return result;
  }
}

/**
 * Сохраняет материалы в базу данных Supabase
 */
async function saveMaterialsToDatabase(materials: ParsedMaterial[]): Promise<number> {
  try {
    const now = new Date().toISOString();
    
    const materialsToSync = materials.map(m => ({
      article: m.article,
      texture: m.texture,
      thickness: m.thickness,
      name: m.name,
      brand: m.brand,
      size: m.size,
      availability: m.availability,
      price: m.price,
      last_synced_at: now,
      source_url: m.sourceUrl || null,
    }));

    const { data, error } = await supabase
      .from('materials')
      .upsert(materialsToSync, {
        onConflict: 'article,texture,thickness',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Ошибка сохранения материалов:', error);
      throw error;
    }

    return data?.length || 0;
  } catch (error: any) {
    console.error('Ошибка сохранения материалов в БД:', error);
    throw error;
  }
}

/**
 * Синхронизация конкретного материала по артикулу
 * (для ручного обновления одного материала)
 */
export async function syncMaterialByArticle(_article: string): Promise<ParsedMaterial | null> {
  try {
    // Пока просто возвращаем null, можно реализовать поиск по артикулу через API
    // если такой endpoint доступен
    console.warn('Синхронизация по артикулу пока не реализована');
    return null;
  } catch (error: any) {
    console.error('Ошибка синхронизации материала:', error);
    return null;
  }
}
