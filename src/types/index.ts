// Типы для базы знаний

export type DocumentType = 'table' | 'document';
export type UserRole = 'admin' | 'partner';

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
  categoryId: string; // ID категории из БД
  description?: string;
  columns: string[]; // Названия колонок
  rows: TableRow[]; // Данные таблицы
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  shareable?: boolean;
  userId?: string; // ID пользователя-владельца
}

export interface Document {
  id: string;
  name: string;
  categoryId: string; // ID категории из БД
  description?: string;
  content: string; // Текстовое содержимое
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  shareable?: boolean;
  userId?: string; // ID пользователя-владельца
}

export type DocumentItem = Table | Document;

export interface Category {
  id: string; // UUID из БД
  name: string;
  parentId?: string | null; // ID родительской категории для подкатегорий
  icon: string;
  color: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
