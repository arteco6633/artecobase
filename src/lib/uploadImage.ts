import { supabase } from './supabase';

/**
 * Загружает изображение в Supabase Storage
 * @param file - файл изображения
 * @param tableId - ID таблицы
 * @param rowId - ID строки таблицы
 * @returns URL загруженного изображения или null в случае ошибки
 */
export async function uploadTableImage(
  file: File,
  tableId: string,
  rowId: string
): Promise<string | null> {
  try {
    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${tableId}/${rowId}-${Date.now()}.${fileExt}`;

    // Загружаем файл в Storage
    const { error } = await supabase.storage
      .from('table-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Ошибка загрузки изображения:', error);
      return null;
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('table-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return null;
  }
}

/**
 * Удаляет изображение из Supabase Storage
 * @param imageUrl - URL изображения для удаления
 */
export async function deleteTableImage(imageUrl: string): Promise<void> {
  try {
    // Извлекаем путь к файлу из URL
    const urlParts = imageUrl.split('/table-images/');
    if (urlParts.length < 2) {
      return;
    }

    const filePath = urlParts[1].split('?')[0]; // Убираем query параметры

    // Удаляем файл
    const { error } = await supabase.storage
      .from('table-images')
      .remove([filePath]);

    if (error) {
      console.error('Ошибка удаления изображения:', error);
    }
  } catch (error) {
    console.error('Ошибка удаления изображения:', error);
  }
}
