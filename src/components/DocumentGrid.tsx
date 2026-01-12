import { useMemo } from 'react';
import { DocumentCard } from './DocumentCard';
import type { DocumentItem, Category } from '../types';
import { FileText } from 'lucide-react';

interface DocumentGridProps {
  documents: DocumentItem[];
  categories: Category[];
  userRole: 'admin' | 'partner';
  onEdit: (doc: DocumentItem) => void;
  onView: (doc: DocumentItem) => void;
  onShare: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
  selectedCategory?: string | 'all';
}

export function DocumentGrid({ 
  documents, 
  categories,
  userRole, 
  onEdit, 
  onView, 
  onShare, 
  onDelete,
  selectedCategory = 'all'
}: DocumentGridProps) {
  // Группировка документов по категориям (только для "Все документы")
  const groupedDocuments = useMemo(() => {
    if (selectedCategory !== 'all') {
      // Если выбрана конкретная категория, не группируем
      return null;
    }

    const grouped: Record<string, DocumentItem[]> = {};
    const uncategorized: DocumentItem[] = [];

    documents.forEach((doc) => {
      if (doc.categoryId) {
        const categoryId = doc.categoryId;
        if (!grouped[categoryId]) {
          grouped[categoryId] = [];
        }
        grouped[categoryId].push(doc);
      } else {
        uncategorized.push(doc);
      }
    });

    // Сортируем категории по позиции
    const sortedCategories = categories
      .filter(cat => grouped[cat.id] && grouped[cat.id].length > 0)
      .sort((a, b) => a.position - b.position);

    return {
      categories: sortedCategories,
      grouped,
      uncategorized,
    };
  }, [documents, categories, selectedCategory]);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {userRole === 'admin' ? 'Нет документов' : 'Документы не найдены'}
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-md">
          {userRole === 'admin'
            ? 'Создайте первый документ или таблицу, используя кнопку "Создать" в верхней панели'
            : 'В этой категории пока нет документов'}
        </p>
      </div>
    );
  }

  // Если выбрана конкретная категория, отображаем простую сетку
  if (selectedCategory !== 'all' || !groupedDocuments) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
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

  // Отображаем документы, сгруппированные по категориям
  return (
    <div className="space-y-8">
      {groupedDocuments.categories.map((category) => {
        const categoryDocs = groupedDocuments.grouped[category.id] || [];
        if (categoryDocs.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <span className="text-sm text-gray-500">
                {categoryDocs.length} {categoryDocs.length === 1 ? 'документ' : categoryDocs.length < 5 ? 'документа' : 'документов'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {categoryDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  userRole={userRole}
                  onEdit={onEdit}
                  onView={onView}
                  onShare={onShare}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Документы без категории */}
      {groupedDocuments.uncategorized.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Без категории</h3>
            <span className="text-sm text-gray-500">
              {groupedDocuments.uncategorized.length} {groupedDocuments.uncategorized.length === 1 ? 'документ' : groupedDocuments.uncategorized.length < 5 ? 'документа' : 'документов'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {groupedDocuments.uncategorized.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                userRole={userRole}
                onEdit={onEdit}
                onView={onView}
                onShare={onShare}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
