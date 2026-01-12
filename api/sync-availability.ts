/**
 * Vercel Serverless Function для синхронизации наличия материалов
 * Использует Puppeteer для парсинга JavaScript-сайта
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createClient } from '@supabase/supabase-js';

// Настройка Chromium для Vercel
chromium.setGraphicsMode(false);

interface AvailabilityData {
  article: string;
  availability: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase environment variables' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // URL для парсинга
    const baseUrl = 'https://dreviz-shop.ru/products?criteria[section]=524&criteria[group]=54e8acc9-d20c-11e6-80d9-00155d006309&criteria[features][25411cc9-33c7-11e6-80d5-00155d006309][]=25411cd1-33c7-11e6-80d5-00155d006309';

    console.log('Запуск браузера...');
    
    // Запускаем браузер
    const browser = await puppeteer.launch({
      args: process.env.VERCEL ? chromium.args : [],
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.VERCEL
        ? await chromium.executablePath()
        : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome',
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    console.log('Загрузка страницы...');
    await page.goto(`${baseUrl}&page=1`, { waitUntil: 'networkidle2', timeout: 30000 });

    // Ждем загрузки таблицы
    await page.waitForSelector('table', { timeout: 10000 });

    console.log('Парсинг данных...');

    // Извлекаем данные из таблицы
    const materials: AvailabilityData[] = await page.evaluate(() => {
      const results: AvailabilityData[] = [];
      const table = document.querySelector('table');
      
      if (!table) return results;

      const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Пропускаем заголовок

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 5) {
          const article = cells[0]?.textContent?.trim() || '';
          const availabilityText = cells[4]?.textContent?.trim() || '';
          const availability = parseInt(availabilityText.replace(/\D/g, ''), 10) || 0;

          if (article && !article.includes('Артикул')) {
            results.push({
              article,
              availability,
            });
          }
        }
      }

      return results;
    });

    await browser.close();

    console.log(`Найдено ${materials.length} материалов`);

    if (materials.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Не удалось получить материалы',
        parsed: 0,
      });
    }

    // Обновляем наличие в базе данных
    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const material of materials) {
      const { error } = await supabase
        .from('materials')
        .update({
          availability: material.availability,
          last_synced_at: now,
        })
        .eq('article', material.article);

      if (!error) {
        updatedCount++;
      } else {
        console.error(`Ошибка обновления ${material.article}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      parsed: materials.length,
      updated: updatedCount,
      message: `Синхронизировано наличие для ${updatedCount} материалов`,
    });
  } catch (error: any) {
    console.error('Ошибка синхронизации:', error);
    return res.status(500).json({
      error: error.message || 'Ошибка синхронизации',
    });
  }
}
