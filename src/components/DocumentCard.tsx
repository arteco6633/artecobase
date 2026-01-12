import type { DocumentItem } from '../types';
import { Share2, Trash2, Table as TableIcon, FileText, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: DocumentItem;
  onEdit: (doc: DocumentItem) => void;
  onView: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onEdit, onView, onShare, onDelete }: DocumentCardProps) {
  const isTable = 'columns' in document;
  const Icon = isTable ? TableIcon : FileText;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isTable ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <Icon className={`w-5 h-5 ${isTable ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
            <p className="text-sm text-gray-500">
              {isTable ? 'Таблица' : 'Документ'} • {format(document.updatedAt, 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {document.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
      )}

      {isTable && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            Колонок: {document.columns.length} • Строк: {document.rows.length}
          </p>
        </div>
      )}

      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {document.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(document)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Просмотреть"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(document)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onShare(document)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Поделиться"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onDelete(document.id)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Удалить"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
