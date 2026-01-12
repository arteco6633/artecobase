import { X } from 'lucide-react';
import type { Table } from '../types';

interface TableViewerProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TableViewer({ table, isOpen, onClose }: TableViewerProps) {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{table.name}</h2>
            {table.description && (
              <p className="text-sm text-gray-500 mt-1">{table.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {table.rows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Таблица пуста
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {table.columns.map((col, index) => (
                      <th
                        key={index}
                        className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-200 px-4 py-3 text-sm text-gray-900"
                        >
                          {cell.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
