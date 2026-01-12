import type { DocumentItem } from '../types';
import { DocumentCard } from './DocumentCard';
import type { UserRole } from '../types';

interface DocumentGridProps {
  documents: DocumentItem[];
  userRole?: UserRole;
  onEdit: (doc: DocumentItem) => void;
  onView: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
}

export function DocumentGrid({ documents, userRole, onEdit, onView, onShare, onDelete }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет документов</h3>
        <p className="text-gray-500">
          {userRole === 'admin' 
            ? 'Создайте первый документ или таблицу, чтобы начать работу'
            : 'Пока нет доступных документов'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          userRole={userRole}
          onEdit={onEdit}
          onView={onView}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
