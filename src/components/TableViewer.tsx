import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import type { Table } from '../types';

interface TableViewerProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TableViewer({ table, isOpen, onClose }: TableViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация строк таблицы по поисковому запросу
  const filteredRows = useMemo(() => {
    if (!table) return [];
    if (!searchQuery.trim()) {
      return table.rows;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return table.rows.filter((row) => {
      // Проверяем все ячейки в строке
      return row.cells.some((cell) => {
        const cellValue = cell.value?.toLowerCase() || '';
        return cellValue.includes(query);
      });
    });
  }, [table, searchQuery]);

  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{table.name}</h2>
            {table.description && (
              <p className="text-sm text-gray-500 mt-1">{table.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Поиск */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по таблице (артикул, название, цена...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Найдено: <span className="font-medium text-gray-700">{filteredRows.length}</span> из <span className="font-medium text-gray-700">{table.rows.length}</span> строк
            </p>
          )}
        </div>

        {/* Таблица */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          {table.rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-lg mb-2">Таблица пуста</p>
              <p className="text-sm">Добавьте данные в таблицу</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-lg mb-2">Ничего не найдено</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    {table.columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      {row.cells.map((cell, cellIndex) => {
                        const cellValue = cell.value || '';
                        const isMatch = searchQuery.trim() && cellValue.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        return (
                          <td
                            key={cellIndex}
                            className={`px-4 py-3 text-sm text-gray-900 border-b border-gray-100 ${
                              cellIndex === 0 ? 'font-medium' : ''
                            }`}
                          >
                            {isMatch && searchQuery.trim() ? (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: cellValue.replace(
                                    new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                    '<mark class="bg-yellow-200 font-semibold">$1</mark>'
                                  )
                                }}
                              />
                            ) : (
                              cellValue
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Подвал с информацией */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Колонок: <span className="font-medium text-gray-700">{table.columns.length}</span>
              {' • '}
              Строк: <span className="font-medium text-gray-700">
                {searchQuery ? filteredRows.length : table.rows.length}
                {searchQuery && table.rows.length !== filteredRows.length && ` / ${table.rows.length}`}
              </span>
            </div>
            <div>
              Обновлено: {new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(table.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
