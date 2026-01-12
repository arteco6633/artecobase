// Supabase Edge Function для парсинга материалов с dreviz-shop.ru
// Работает на Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaterialData {
  article: string;
  availability: number;
}

serve(async (req) => {
  // Обработка CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Получаем переменные окружения Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // URL для парсинга
    const baseUrl = 'https://dreviz-shop.ru/products?criteria[section]=524&criteria[group]=54e8acc9-d20c-11e6-80d9-00155d006309&criteria[features][25411cc9-33c7-11e6-80d5-00155d006309][]=25411cd1-33c7-11e6-80d5-00155d006309'
    
    const materials: MaterialData[] = []
    let page = 1
    const maxPages = 5 // Ограничение для теста

    // Парсим страницы
    while (page <= maxPages) {
      try {
        const url = `${baseUrl}&page=${page}`
        console.log(`Парсинг страницы ${page}...`)
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ArtecoBase/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        })

        if (!response.ok) {
          console.error(`Ошибка HTTP ${response.status} на странице ${page}`)
          break
        }

        const html = await response.text()
        
        // Парсим HTML (упрощенный вариант - извлекаем данные из таблицы)
        const pageMaterials = parseHTMLTable(html, url)
        
        if (pageMaterials.length === 0) {
          console.log(`Нет данных на странице ${page}, завершаем`)
          break
        }

        materials.push(...pageMaterials)
        console.log(`Найдено ${pageMaterials.length} материалов на странице ${page}`)
        
        page++
        
        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Ошибка на странице ${page}:`, error)
        break
      }
    }

    // Сохраняем материалы в базу данных
    if (materials.length > 0) {
      const now = new Date().toISOString()
      
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
        source_url: m.sourceUrl,
      }))

      const { data, error } = await supabase
        .from('materials')
        .upsert(materialsToSync, {
          onConflict: 'article,texture,thickness',
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error('Ошибка сохранения:', error)
        throw error
      }

      return new Response(
        JSON.stringify({
          success: true,
          parsed: materials.length,
          saved: data?.length || 0,
          message: `Синхронизировано ${data?.length || 0} материалов`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Не удалось получить материалы'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error) {
    console.error('Ошибка функции:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/**
 * Парсит HTML таблицу и извлекает данные материалов
 * Это упрощенный вариант - в реальности может потребоваться более сложный парсинг
 */
function parseHTMLTable(html: string, baseUrl: string): MaterialData[] {
  const materials: MaterialData[] = []
  
  // Регулярные выражения для извлечения данных
  // Это пример - нужно адаптировать под реальную структуру HTML
  
  // Ищем строки таблицы (tr элементы)
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs
  const rows = html.match(rowRegex) || []
  
  for (const row of rows) {
    // Извлекаем ячейки (td элементы)
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gs
    const cells: string[] = []
    let match
    
    while ((match = cellRegex.exec(row)) !== null) {
      // Удаляем HTML теги
      const text = match[1].replace(/<[^>]*>/g, '').trim()
      cells.push(text)
    }
    
    // Если нашли достаточно ячеек (артикул, название, наличие, цена)
    if (cells.length >= 4) {
      const article = cells[0] || ''
      const name = cells[3] || '' // Примерная позиция
      const availability = parseInt(cells[4] || '0', 10) || 0
      const priceStr = cells[5] || '' // Примерная позиция
      const price = parsePrice(priceStr)
      
      // Извлекаем дополнительные данные из названия
      const texture = extractTexture(name)
      const thickness = extractThickness(name)
      const brand = extractBrand(name)
      const size = extractSize(name)
      
      if (article && name) {
        materials.push({
          article,
          name,
          availability,
          price,
          texture,
          thickness,
          brand,
          size,
          sourceUrl: baseUrl,
        })
      }
    }
  }
  
  return materials
}

function extractTexture(name: string): string | null {
  const match = name.match(/\b([A-ZА-Я]{2,3})\s*$/);
  return match ? match[1] : null;
}

function extractThickness(name: string): string | null {
  const match = name.match(/\b(\d{2})\s*(?:мм|mm)?\b/);
  return match ? match[1] : null;
}

function extractBrand(name: string): string | null {
  const match = name.match(/ЛДСП\s+([А-ЯЁ][а-яё]+)/);
  return match ? match[1] : null;
}

function extractSize(name: string): string | null {
  const match = name.match(/\b(\d+\*\d+\*\d+)\b/);
  return match ? match[1] : null;
}

function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
