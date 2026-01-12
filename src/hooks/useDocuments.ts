import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { DocumentItem, Table, Document } from '../types';

// Интерфейс для данных из Supabase
interface DocumentRow {
  id: string;
  name: string;
  category: string | null; // Старое поле, оставляем для обратной совместимости
  category_id: string | null; // Новое поле
  description: string | null;
  type: 'table' | 'document';
  content: any; // JSON для таблиц: {columns: [], rows: []}, для документов: {text: ""}
  tags: string[];
  shareable: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// Хук для управления документами и таблицами через Supabase
export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка документов из Supabase
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*, category_id')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Преобразуем данные из Supabase в формат приложения
      const transformedDocs: DocumentItem[] = (data || []).map((row: DocumentRow) => {
        // Используем category_id, если есть
        const categoryId = row.category_id || '';
        
        if (row.type === 'table') {
          const tableContent = row.content as { columns: string[]; rows: Array<{ id: string; cells: Array<{ value: string }>; imageUrl?: string }> };
          return {
            id: row.id,
            name: row.name,
            categoryId: categoryId,
            description: row.description || undefined,
            columns: tableContent?.columns || [],
            rows: tableContent?.rows || [],
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            tags: row.tags || [],
            shareable: row.shareable,
            userId: (row as any).user_id,
          } as Table;
        } else {
          const docContent = row.content as { text: string };
          return {
            id: row.id,
            name: row.name,
            categoryId: categoryId,
            description: row.description || undefined,
            content: docContent?.text || '',
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            tags: row.tags || [],
            shareable: row.shareable,
            userId: (row as any).user_id,
          } as Document;
        }
      });

      setDocuments(transformedDocs);
    } catch (err: any) {
      console.error('Ошибка загрузки документов:', err);
      setError(err.message || 'Ошибка загрузки документов');
    } finally {
      setLoading(false);
    }
  };

  const addTable = async (table: Table) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          name: table.name,
          category_id: table.categoryId,
          description: table.description || null,
          type: 'table',
          content: {
            columns: table.columns,
            rows: table.rows,
          },
          tags: table.tags,
          shareable: table.shareable ?? true,
          user_id: userId,
        });

      if (insertError) throw insertError;

      await loadDocuments();
    } catch (err: any) {
      console.error('Ошибка добавления таблицы:', err);
      setError(err.message || 'Ошибка добавления таблицы');
      throw err;
    }
  };

  const addDocument = async (doc: Document) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          name: doc.name,
          category_id: doc.categoryId,
          description: doc.description || null,
          type: 'document',
          content: {
            text: doc.content,
          },
          tags: doc.tags,
          shareable: doc.shareable ?? true,
          user_id: userId,
        });

      if (insertError) throw insertError;

      await loadDocuments();
    } catch (err: any) {
      console.error('Ошибка добавления документа:', err);
      setError(err.message || 'Ошибка добавления документа');
      throw err;
    }
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      const table = documents.find(d => d.id === id && 'columns' in d) as Table | undefined;
      if (!table) throw new Error('Таблица не найдена');

      const updatedTable = { ...table, ...updates };

          const { error: updateError } = await supabase
            .from('documents')
            .update({
              name: updatedTable.name,
              category_id: updatedTable.categoryId,
              description: updatedTable.description || null,
              content: {
                columns: updatedTable.columns,
                rows: updatedTable.rows,
              },
              tags: updatedTable.tags,
              shareable: updatedTable.shareable,
            })
            .eq('id', id);

      if (updateError) throw updateError;

      await loadDocuments();
    } catch (err: any) {
      console.error('Ошибка обновления таблицы:', err);
      setError(err.message || 'Ошибка обновления таблицы');
      throw err;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const doc = documents.find(d => d.id === id && 'content' in d) as Document | undefined;
      if (!doc) throw new Error('Документ не найден');

      const updatedDoc = { ...doc, ...updates };

          const { error: updateError } = await supabase
            .from('documents')
            .update({
              name: updatedDoc.name,
              category_id: updatedDoc.categoryId,
              description: updatedDoc.description || null,
              content: {
                text: updatedDoc.content,
              },
              tags: updatedDoc.tags,
              shareable: updatedDoc.shareable,
            })
            .eq('id', id);

      if (updateError) throw updateError;

      await loadDocuments();
    } catch (err: any) {
      console.error('Ошибка обновления документа:', err);
      setError(err.message || 'Ошибка обновления документа');
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await loadDocuments();
    } catch (err: any) {
      console.error('Ошибка удаления документа:', err);
      setError(err.message || 'Ошибка удаления документа');
      throw err;
    }
  };

  const generateShareLink = (id: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${id}`;
  };

  return {
    documents,
    loading,
    error,
    addTable,
    addDocument,
    updateTable,
    updateDocument,
    deleteDocument,
    generateShareLink,
    refetch: loadDocuments,
  };
}
