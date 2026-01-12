import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Document, Category } from '../types';

interface DocumentEditorProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: Document) => void;
  categories: Category[];
}

export function DocumentEditor({ document, isOpen, onClose, onSave, categories }: DocumentEditorProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (document) {
      setName(document.name);
      setCategoryId(document.categoryId);
      setDescription(document.description || '');
      setContent(document.content);
    } else {
      // Новый документ - используем первую категорию по умолчанию
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDescription('');
      setContent('');
    }
  }, [document, isOpen, categories]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert('Введите название документа');
      return;
    }

    if (!categoryId) {
      alert('Выберите категорию');
      return;
    }

    const docData: Document = {
      id: document?.id || '', // ID будет сгенерирован на сервере
      name: name.trim(),
      categoryId: categoryId,
      description: description.trim() || undefined,
      content,
      createdAt: document?.createdAt || new Date(),
      updatedAt: new Date(),
      tags: [],
      shareable: true,
    };

    onSave(docData);
    onClose();
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {document ? 'Редактировать документ' : 'Создать документ'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название документа *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Инструкция по работе с материалом"
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
                placeholder="Краткое описание документа..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержимое документа
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Введите текст документа..."
              />
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
