import { useState, useEffect } from 'react';
import type { DocumentItem, Table, Document } from '../types';

// Хук для управления документами и таблицами
export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Загрузка документов из localStorage
  useEffect(() => {
    const savedDocs = localStorage.getItem('artecobase-documents');
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        setDocuments(parsed.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        })));
      } catch (e) {
        console.error('Ошибка загрузки документов:', e);
      }
    }
  }, []);

  // Сохранение документов в localStorage
  const saveDocuments = (newDocs: DocumentItem[]) => {
    localStorage.setItem('artecobase-documents', JSON.stringify(newDocs));
    setDocuments(newDocs);
  };

  const addTable = (table: Table) => {
    const newDocs = [...documents, table];
    saveDocuments(newDocs);
  };

  const addDocument = (doc: Document) => {
    const newDocs = [...documents, doc];
    saveDocuments(newDocs);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    const newDocs = documents.map(doc => {
      if (doc.id === id && 'columns' in doc) {
        return { ...doc, ...updates, updatedAt: new Date() } as Table;
      }
      return doc;
    });
    saveDocuments(newDocs);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    const newDocs = documents.map(doc => {
      if (doc.id === id && 'content' in doc) {
        return { ...doc, ...updates, updatedAt: new Date() } as Document;
      }
      return doc;
    });
    saveDocuments(newDocs);
  };

  const deleteDocument = (id: string) => {
    const newDocs = documents.filter(d => d.id !== id);
    saveDocuments(newDocs);
  };

  const generateShareLink = (id: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${id}`;
  };

  return {
    documents,
    addTable,
    addDocument,
    updateTable,
    updateDocument,
    deleteDocument,
    generateShareLink,
  };
}
