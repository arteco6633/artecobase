import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight } from 'lucide-react';
import type { Category } from '../types';
import { useCategories } from '../hooks/useCategories';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { categories, loading, addCategory, updateCategory, deleteCategory, refetch } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parentId: '',
    icon: 'folder',
    color: 'blue',
    position: 0,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
      // Автоматически раскрываем все категории при открытии
      setExpandedCategories(new Set(categories.map(c => c.id)));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Получаем только категории верхнего уровня
  const topLevelCategories = categories.filter(cat => !cat.parentId).sort((a, b) => a.position - b.position);

  // Получаем подкатегории для конкретной категории
  const getSubcategories = (parentId: string): Category[] => {
    return categories.filter(cat => cat.parentId === parentId).sort((a, b) => a.position - b.position);
  };

  // Получаем все подкатегории рекурсивно
  const getAllSubcategoryIds = (parentId: string): string[] => {
    const result: string[] = [];
    const directChildren = getSubcategories(parentId);
    for (const child of directChildren) {
      result.push(child.id);
      result.push(...getAllSubcategoryIds(child.id));
    }
    return result;
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Введите название категории');
      return;
    }

    try {
      await addCategory({
        name: newCategory.name.trim(),
        parentId: newCategory.parentId || undefined,
        icon: newCategory.icon,
        color: newCategory.color,
        position: newCategory.position,
      });
      setNewCategory({
        name: '',
        parentId: '',
        icon: 'folder',
        color: 'blue',
        position: 0,
      });
      setShowAddForm(false);
      await refetch();
    } catch (error: any) {
      alert(`Ошибка добавления категории: ${error.message}`);
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      await updateCategory(category.id, {
        name: category.name,
        parentId: category.parentId || undefined,
        icon: category.icon,
        color: category.color,
        position: category.position,
      });
      setEditingCategory(null);
      await refetch();
    } catch (error: any) {
      alert(`Ошибка обновления категории: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const subcategories = getAllSubcategoryIds(categoryId);
    const totalCount = subcategories.length + 1;

    if (!window.confirm(`Вы уверены, что хотите удалить категорию "${category.name}" и все её подкатегории (всего ${totalCount})?`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await refetch();
    } catch (error: any) {
      alert(`Ошибка удаления категории: ${error.message}`);
    }
  };

  const getCategoryColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      gray: 'bg-gray-100 text-gray-700',
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const isEditing = editingCategory?.id === category.id;

    return (
      <div key={category.id} className="mb-2">
        <div
          className={`flex items-center space-x-2 p-3 rounded-lg border ${
            isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {subcategories.length > 0 ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {isEditing ? (
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={editingCategory!.name}
                onChange={(e) => setEditingCategory({ ...editingCategory!, name: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
                placeholder="Название категории"
              />
              <select
                value={editingCategory!.icon}
                onChange={(e) => setEditingCategory({ ...editingCategory!, icon: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value="folder">📁</option>
                <option value="package">📦</option>
                <option value="wrench">🔩</option>
                <option value="file-text">📋</option>
                <option value="factory">🏭</option>
              </select>
              <select
                value={editingCategory!.color}
                onChange={(e) => setEditingCategory({ ...editingCategory!, color: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value="blue">Синий</option>
                <option value="green">Зеленый</option>
                <option value="purple">Фиолетовый</option>
                <option value="orange">Оранжевый</option>
                <option value="red">Красный</option>
                <option value="yellow">Желтый</option>
                <option value="gray">Серый</option>
              </select>
              <input
                type="number"
                value={editingCategory!.position}
                onChange={(e) => setEditingCategory({ ...editingCategory!, position: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
                placeholder="Позиция"
              />
              <button
                onClick={() => handleUpdateCategory(editingCategory!)}
                className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                title="Сохранить"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                title="Отмена"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className={`w-8 h-8 rounded flex items-center justify-center ${getCategoryColorClass(category.color)}`}>
                <span>{category.icon || '📁'}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-xs text-gray-500">
                  Позиция: {category.position} {subcategories.length > 0 && `• Подкатегорий: ${subcategories.length}`}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Редактировать"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {isExpanded && subcategories.length > 0 && (
          <div className="mt-1">
            {subcategories.map(subcategory => renderCategory(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Управление категориями</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Загрузка категорий...</div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Категории</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Добавить категорию</span>
                </button>
              </div>

              {showAddForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Новая категория</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название *
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Название категории"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Родительская категория (для подкатегории)
                      </label>
                      <select
                        value={newCategory.parentId}
                        onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Нет (основная категория)</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Иконка
                        </label>
                        <select
                          value={newCategory.icon}
                          onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="folder">📁</option>
                          <option value="package">📦</option>
                          <option value="wrench">🔩</option>
                          <option value="file-text">📋</option>
                          <option value="factory">🏭</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Цвет
                        </label>
                        <select
                          value={newCategory.color}
                          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="blue">Синий</option>
                          <option value="green">Зеленый</option>
                          <option value="purple">Фиолетовый</option>
                          <option value="orange">Оранжевый</option>
                          <option value="red">Красный</option>
                          <option value="yellow">Желтый</option>
                          <option value="gray">Серый</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Позиция
                        </label>
                        <input
                          type="number"
                          value={newCategory.position}
                          onChange={(e) => setNewCategory({ ...newCategory, position: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Добавить
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewCategory({
                            name: '',
                            parentId: '',
                            icon: 'folder',
                            color: 'blue',
                            position: 0,
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {topLevelCategories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Нет категорий. Создайте первую категорию.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topLevelCategories.map(category => renderCategory(category))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
