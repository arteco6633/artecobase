import { Eye, Edit2, Share2, Trash2, FileText, Table2 } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DocumentCardProps {
  document: DocumentItem;
  userRole: 'admin' | 'partner';
  onEdit: (doc: DocumentItem) => void;
  onView: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, userRole, onEdit, onView, onShare, onDelete }: DocumentCardProps) {
  const isTable = 'columns' in document;
  const Icon = isTable ? Table2 : FileText;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 card-shadow hover:card-shadow-hover group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {document.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isTable ? 'Таблица' : 'Документ'} • {formatDate(document.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {document.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
      )}

      {isTable && (
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
          <span className="flex items-center space-x-1">
            <span className="font-medium">{document.columns.length}</span>
            <span>колонок</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="font-medium">{document.rows.length}</span>
            <span>строк</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(document)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Просмотр"
          >
            <Eye className="w-4 h-4" />
          </button>

          {userRole === 'admin' && (
            <>
              <button
                onClick={() => onEdit(document)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Редактировать"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onShare(document)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                title="Поделиться"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(document.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="flex items-center space-x-1 flex-wrap gap-1">
            {document.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{document.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
