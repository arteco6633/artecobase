import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types';

interface CategoryRow {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('position', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const transformedCategories: Category[] = (data || []).map((row: CategoryRow) => ({
        id: row.id,
        name: row.name,
        parentId: row.parent_id,
        icon: row.icon,
        color: row.color,
        position: row.position,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.user_id || undefined,
      }));

      setCategories(transformedCategories);
    } catch (err: any) {
      console.error('Ошибка загрузки категорий:', err);
      setError(err.message || 'Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const { error: insertError } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          parent_id: category.parentId || null,
          icon: category.icon,
          color: category.color,
          position: category.position,
          user_id: userId,
        });

      if (insertError) throw insertError;
      await loadCategories();
    } catch (err: any) {
      console.error('Ошибка добавления категории:', err);
      setError(err.message || 'Ошибка добавления категории');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          parent_id: updates.parentId || null,
          icon: updates.icon,
          color: updates.color,
          position: updates.position,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      await loadCategories();
    } catch (err: any) {
      console.error('Ошибка обновления категории:', err);
      setError(err.message || 'Ошибка обновления категории');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await loadCategories();
    } catch (err: any) {
      console.error('Ошибка удаления категории:', err);
      setError(err.message || 'Ошибка удаления категории');
      throw err;
    }
  };

  // Получить категории по родителю (для подкатегорий)
  const getCategoriesByParent = (parentId: string | null | undefined): Category[] => {
    return categories.filter(cat => {
      if (parentId === null || parentId === undefined) {
        return !cat.parentId;
      }
      return cat.parentId === parentId;
    });
  };

  // Получить все подкатегории (рекурсивно)
  const getAllSubcategories = (parentId: string): Category[] => {
    const result: Category[] = [];
    const directChildren = categories.filter(cat => cat.parentId === parentId);
    
    for (const child of directChildren) {
      result.push(child);
      result.push(...getAllSubcategories(child.id));
    }
    
    return result;
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByParent,
    getAllSubcategories,
    refetch: loadCategories,
  };
}
