import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Material {
  id: string;
  article: string;
  texture: string | null;
  thickness: string | null;
  name: string;
  brand: string | null;
  size: string | null;
  availability: number;
  price: number | null;
  lastSyncedAt: Date | null;
  sourceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MaterialRow {
  id: string;
  article: string;
  texture: string | null;
  thickness: string | null;
  name: string;
  brand: string | null;
  size: string | null;
  availability: number;
  price: number | null;
  last_synced_at: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Хук для работы с материалами
 */
export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка материалов из Supabase
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('materials')
        .select('*')
        .order('article', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const transformedMaterials: Material[] = (data || []).map((row: MaterialRow) => ({
        id: row.id,
        article: row.article,
        texture: row.texture,
        thickness: row.thickness,
        name: row.name,
        brand: row.brand,
        size: row.size,
        availability: row.availability,
        price: row.price,
        lastSyncedAt: row.last_synced_at ? new Date(row.last_synced_at) : null,
        sourceUrl: row.source_url,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      setMaterials(transformedMaterials);
    } catch (err: any) {
      console.error('Ошибка загрузки материалов:', err);
      setError(err.message || 'Не удалось загрузить материалы');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Сохранение или обновление материала
   */
  const upsertMaterial = async (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error: upsertError } = await supabase
        .from('materials')
        .upsert({
          article: material.article,
          texture: material.texture,
          thickness: material.thickness,
          name: material.name,
          brand: material.brand,
          size: material.size,
          availability: material.availability,
          price: material.price,
          last_synced_at: new Date().toISOString(),
          source_url: material.sourceUrl || null,
        }, {
          onConflict: 'article,texture,thickness',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      // Перезагружаем материалы после обновления
      await loadMaterials();

      return data;
    } catch (err: any) {
      console.error('Ошибка сохранения материала:', err);
      throw err;
    }
  };

  /**
   * Массовое сохранение материалов
   */
  const syncMaterials = async (materials: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>[]) => {
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

      const { data, error: syncError } = await supabase
        .from('materials')
        .upsert(materialsToSync, {
          onConflict: 'article,texture,thickness',
          ignoreDuplicates: false,
        })
        .select();

      if (syncError) {
        throw syncError;
      }

      // Перезагружаем материалы после синхронизации
      await loadMaterials();

      return data;
    } catch (err: any) {
      console.error('Ошибка синхронизации материалов:', err);
      throw err;
    }
  };

  /**
   * Поиск материала по артикулу
   */
  const findMaterialByArticle = (article: string): Material | undefined => {
    return materials.find(m => m.article === article);
  };

  /**
   * Поиск материалов по артикулу и тиснению
   */
  const findMaterialsByArticleAndTexture = (article: string, texture: string | null): Material[] => {
    return materials.filter(m => 
      m.article === article && 
      (texture === null || m.texture === texture)
    );
  };

  return {
    materials,
    loading,
    error,
    loadMaterials,
    upsertMaterial,
    syncMaterials,
    findMaterialByArticle,
    findMaterialsByArticleAndTexture,
  };
}
