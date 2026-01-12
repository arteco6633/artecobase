import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Table, CategoryType } from '../types';

interface TableEditorProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Table) => void;
}

export function TableEditor({ table, isOpen, onClose, onSave }: TableEditorProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('materials');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<string[]>(['Название', 'Цена', 'Ед. изм.']);
  const [rows, setRows] = useState<Array<{ id: string; cells: Array<{ value: string }> }>>([]);

  useEffect(() => {
    if (table) {
      setName(table.name);
      setCategory(table.category);
      setDescription(table.description || '');
      setColumns(table.columns);
      setRows(table.rows);
    } else {
      // Новый документ
      setName('');
      setCategory('materials');
      setDescription('');
      setColumns(['Название', 'Цена', 'Ед. изм.']);
      setRows([]);
    }
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    const newColumnName = prompt('Введите название колонки:');
    if (newColumnName) {
      setColumns([...columns, newColumnName]);
      setRows(rows.map(row => ({
        ...row,
        cells: [...row.cells, { value: '' }],
      })));
    }
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
    }]);
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

    const tableData: Table = {
      id: table?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      category,
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
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="materials">Материалы</option>
                <option value="furniture">Фурнитура</option>
                <option value="order-forms">Бланки заказа</option>
                <option value="production">Производство</option>
                <option value="other">Прочее</option>
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
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Данные таблицы</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddColumn}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить колонку</span>
                </button>
                <button
                  onClick={handleAddRow}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить строку</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col, colIndex) => (
                      <th key={colIndex} className="border border-gray-200 p-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={col}
                            onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                          />
                          {columns.length > 1 && (
                            <button
                              onClick={() => handleRemoveColumn(colIndex)}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Удалить колонку"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="border border-gray-200 p-2 w-16 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="border border-gray-200 p-8 text-center text-gray-500">
                        Нет данных. Нажмите "Добавить строку" для начала работы
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.cells.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-200 p-2">
                            <input
                              type="text"
                              value={cell.value}
                              onChange={(e) => handleCellChange(row.id, cellIndex, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                        ))}
                        <td className="border border-gray-200 p-2">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Удалить строку"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
    </div>
  );
}
