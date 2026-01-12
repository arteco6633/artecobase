// Типы для базы знаний

export type CategoryType = 'materials' | 'furniture' | 'order-forms' | 'production' | 'other';
export type DocumentType = 'table' | 'document';

export interface TableCell {
  value: string;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface Table {
  id: string;
  name: string;
  category: CategoryType;
  description?: string;
  columns: string[]; // Названия колонок
  rows: TableRow[]; // Данные таблицы
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  shareable?: boolean;
}

export interface Document {
  id: string;
  name: string;
  category: CategoryType;
  description?: string;
  content: string; // Текстовое содержимое
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  shareable?: boolean;
}

export type DocumentItem = Table | Document;

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
}
