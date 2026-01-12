import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import type { Table, Category } from '../types';
import { uploadTableImage } from '../lib/uploadImage';
import { ImageViewer } from './ImageViewer';

interface TableEditorProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Table) => void;
  categories: Category[];
}

export function TableEditor({ table, isOpen, onClose, onSave, categories }: TableEditorProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<string[]>(['Название', 'Цена', 'Ед. изм.']);
  const [rows, setRows] = useState<Array<{ id: string; cells: Array<{ value: string }>; imageUrl?: string }>>([]);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (table) {
      setName(table.name);
      setCategoryId(table.categoryId);
      setDescription(table.description || '');
      setColumns(table.columns);
      setRows(table.rows);
    } else {
      // Новый документ - используем первую категорию по умолчанию
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDescription('');
      setColumns(['Название', 'Цена', 'Ед. изм.']);
      setRows([]);
    }
  }, [table, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    // Добавляем колонку с автоматическим названием, которое можно сразу редактировать
    const newColumnName = `Колонка ${columns.length + 1}`;
    setColumns([...columns, newColumnName]);
    setRows(rows.map(row => ({
      ...row,
      cells: [...row.cells, { value: '' }],
    })));
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length <= 1) {
      alert('Должна быть хотя бы одна колонка');
      return;
    }
    setColumns(columns.filter((_, i) => i !== index));
    setRows(rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== index),
    })));
  };

  const handleAddRow = () => {
    setRows([...rows, {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      cells: columns.map(() => ({ value: '' })),
      imageUrl: undefined,
    }]);
  };

  const handleImageUpload = async (rowId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    // Используем временный ID для новой таблицы
    const tableId = table?.id || 'temp-' + Date.now();
    
    setUploadingImage(rowId);
    try {
      const imageUrl = await uploadTableImage(file, tableId, rowId);
      if (imageUrl) {
        setRows(rows.map(row => 
          row.id === rowId ? { ...row, imageUrl } : row
        ));
      } else {
        alert('Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      alert('Ошибка загрузки изображения');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleImageClick = (rowId: string) => {
    fileInputRefs.current[rowId]?.click();
  };

  const handleImageRemove = (rowId: string) => {
    setRows(rows.map(row => 
      row.id === rowId ? { ...row, imageUrl: undefined } : row
    ));
  };

  const handleRemoveRow = (rowId: string) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const handleCellChange = (rowId: string, cellIndex: number, value: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const newCells = [...row.cells];
        newCells[cellIndex] = { value };
        return { ...row, cells: newCells };
      }
      return row;
    }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Введите название таблицы');
      return;
    }

    if (!categoryId) {
      alert('Выберите категорию');
      return;
    }

    const tableData: Table = {
      id: table?.id || '', // ID будет сгенерирован на сервере
      name: name.trim(),
      categoryId: categoryId,
      description: description.trim() || undefined,
      columns,
      rows,
      createdAt: table?.createdAt || new Date(),
      updatedAt: new Date(),
      tags: [],
      shareable: true,
    };

    onSave(tableData);
    onClose();
  };

  const handleColumnNameChange = (index: number, newName: string) => {
    const newColumns = [...columns];
    newColumns[index] = newName;
    setColumns(newColumns);
  };

  // Функция для отображения категории с учетом иерархии
  const getCategoryDisplayName = (category: Category, allCategories: Category[]): string => {
    if (!category.parentId) {
      return category.name;
    }
    const parent = allCategories.find(c => c.id === category.parentId);
    if (parent) {
      return `${parent.name} > ${category.name}`;
    }
    return category.name;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {table ? 'Редактировать таблицу' : 'Создать таблицу'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название таблицы *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Прайс-лист на материалы"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.length === 0 && (
                  <option value="">Нет категорий</option>
                )}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryDisplayName(category, categories)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание (необязательно)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Добавьте описание таблицы..."
              />
            </div>
          </div>

          {/* Редактор таблицы */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Структура таблицы</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddColumn}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить колонку</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {columns.map((column, index) => (
                      <th key={index} className="px-4 py-3 text-left">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={column}
                            onChange={(e) => handleColumnNameChange(index, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Название колонки"
                          />
                          {columns.length > 1 && (
                            <button
                              onClick={() => handleRemoveColumn(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Удалить колонку"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                        Нет данных. Добавьте строки, используя кнопку ниже.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                        {row.cells.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2">
                            <input
                              type="text"
                              value={cell.value}
                              onChange={(e) => handleCellChange(row.id, cellIndex, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              ref={(el) => {
                                fileInputRefs.current[row.id] = el;
                              }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(row.id, file);
                                }
                                // Сброс input для возможности выбора того же файла снова
                                e.target.value = '';
                              }}
                              accept="image/*"
                              className="hidden"
                            />
                            {row.imageUrl ? (
                              <div className="relative group">
                                <img
                                  src={row.imageUrl}
                                  alt="Превью"
                                  className="w-10 h-10 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageUrl(row.imageUrl || null);
                                  }}
                                  title="Нажмите для увеличения"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageClick(row.id);
                                  }}
                                  className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                  title="Заменить фото"
                                  style={{ fontSize: '10px' }}
                                >
                                  ↻
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageRemove(row.id);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Удалить фото"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleImageClick(row.id)}
                                disabled={uploadingImage === row.id}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Добавить фото"
                              >
                                {uploadingImage === row.id ? (
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <ImageIcon className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Удалить строку"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить строку</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Сохранить</span>
          </button>
        </div>
      </div>

      {/* Модальное окно для просмотра фото */}
      {selectedImageUrl && (
        <ImageViewer
          imageUrl={selectedImageUrl}
          isOpen={!!selectedImageUrl}
          onClose={() => setSelectedImageUrl(null)}
        />
      )}
    </div>
  );
}
