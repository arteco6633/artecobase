import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, X, Save, Folder, Package, Wrench, FileText, Factory, type LucideIcon } from 'lucide-react';
import type { Category } from '../types';
import { useCategories } from '../hooks/useCategories';

interface SidebarProps {
  selectedCategory: string | 'all';
  onCategorySelect: (category: string | 'all') => void;
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// Функция для получения иконки по имени
const getCategoryIcon = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    folder: Folder,
    package: Package,
    wrench: Wrench,
    'file-text': FileText,
    factory: Factory,
  };
  return iconMap[iconName] || Folder;
};

// Функция для получения цвета по имени
const getColorClass = (color: string, isSelected: boolean): string => {
  const colorMap: Record<string, string> = {
    blue: isSelected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-blue-600 hover:bg-blue-50',
    green: isSelected ? 'bg-green-50 text-green-700 border-green-200' : 'text-green-600 hover:bg-green-50',
    purple: isSelected ? 'bg-purple-50 text-purple-700 border-purple-200' : 'text-purple-600 hover:bg-purple-50',
    orange: isSelected ? 'bg-orange-50 text-orange-700 border-orange-200' : 'text-orange-600 hover:bg-orange-50',
    red: isSelected ? 'bg-red-50 text-red-700 border-red-200' : 'text-red-600 hover:bg-red-50',
    yellow: isSelected ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'text-yellow-600 hover:bg-yellow-50',
    gray: isSelected ? 'bg-gray-50 text-gray-700 border-gray-200' : 'text-gray-600 hover:bg-gray-50',
  };
  return colorMap[color] || colorMap.blue;
};

// Функция для получения цвета иконки
const getIconColorClass = (color: string, isSelected: boolean): string => {
  const colorMap: Record<string, string> = {
    blue: isSelected ? 'text-blue-600' : 'text-blue-500',
    green: isSelected ? 'text-green-600' : 'text-green-500',
    purple: isSelected ? 'text-purple-600' : 'text-purple-500',
    orange: isSelected ? 'text-orange-600' : 'text-orange-500',
    red: isSelected ? 'text-red-600' : 'text-red-500',
    yellow: isSelected ? 'text-yellow-600' : 'text-yellow-500',
    gray: isSelected ? 'text-gray-600' : 'text-gray-500',
  };
  return colorMap[color] || colorMap.blue;
};

export function Sidebar({ selectedCategory, onCategorySelect, isAdmin = false, isOpen = true, onClose }: SidebarProps) {
  const { categories, addCategory, updateCategory, deleteCategory, refetch } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingToParent, setAddingToParent] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parentId: '',
    icon: 'folder',
    color: 'blue',
    position: 0,
  });

  // Автоматически закрываем сайдбар на мобильных при выборе категории
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isOpen && onClose) {
        // На мобильных можно автоматически закрывать, но оставим это опциональным
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  // Получаем только категории верхнего уровня (без родителя)
  const topLevelCategories = categories.filter(cat => !cat.parentId).sort((a, b) => a.position - b.position);

  // Получаем подкатегории для конкретной категории
  const getSubcategories = (parentId: string): Category[] => {
    return categories.filter(cat => cat.parentId === parentId).sort((a, b) => a.position - b.position);
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

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategory({ ...category });
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategory(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategoryId || !editingCategory.name?.trim()) {
      alert('Введите название категории');
      return;
    }

    try {
      await updateCategory(editingCategoryId, {
        name: editingCategory.name.trim(),
        parentId: editingCategory.parentId || undefined,
        icon: editingCategory.icon || 'folder',
        color: editingCategory.color || 'blue',
        position: editingCategory.position || 0,
      });
      setEditingCategoryId(null);
      setEditingCategory(null);
      await refetch();
    } catch (error: any) {
      alert(`Ошибка обновления: ${error.message}`);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (!window.confirm(`Удалить категорию "${category.name}" и все подкатегории?`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await refetch();
    } catch (error: any) {
      alert(`Ошибка удаления: ${error.message}`);
    }
  };

  const handleStartAdd = (parentId: string | null = null) => {
    setAddingToParent(parentId);
    setNewCategory({
      name: '',
      parentId: parentId || '',
      icon: 'folder',
      color: 'blue',
      position: 0,
    });
    setShowAddForm(true);
    if (parentId) {
      setExpandedCategories(new Set([...expandedCategories, parentId]));
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAddingToParent(null);
    setNewCategory({
      name: '',
      parentId: '',
      icon: 'folder',
      color: 'blue',
      position: 0,
    });
  };

  const handleSaveAdd = async () => {
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
      handleCancelAdd();
      await refetch();
    } catch (error: any) {
      alert(`Ошибка добавления: ${error.message}`);
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const isEditing = editingCategoryId === category.id && editingCategory;
    const IconComponent = getCategoryIcon(category.icon);

    return (
      <div key={category.id}>
        <div
          className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
            isSelected 
              ? `${getColorClass(category.color, true)} border-l-2` 
              : `text-gray-700 hover:bg-gray-50 ${getColorClass(category.color, false)}`
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          {subcategories.length > 0 || isAdmin ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {isEditing ? (
            <>
              <input
                type="text"
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Сохранить"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Отмена"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onCategorySelect(category.id);
                  // Закрываем сайдбар только на мобильных
                  if (window.innerWidth < 1024) {
                    onClose?.();
                  }
                }}
                className="flex items-center space-x-2 flex-1 min-w-0"
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 ${getIconColorClass(category.color, isSelected)}`} />
                <span className="font-medium break-words">{category.name}</span>
                {subcategories.length > 0 && (
                  <span className="text-xs opacity-60 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {subcategories.length}
                  </span>
                )}
              </button>

              {isAdmin && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartAdd(category.id);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Добавить подкатегорию"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(category);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Редактировать"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category.id);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {isExpanded && (
          <div>
            {showAddForm && addingToParent === category.id && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 mx-2 my-1" style={{ marginLeft: `${(level + 1) * 16 + 8}px` }}>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Название подкатегории"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAdd();
                    if (e.key === 'Escape') handleCancelAdd();
                  }}
                  autoFocus
                />
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleSaveAdd}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handleCancelAdd}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
            {subcategories.map(subcategory => renderCategory(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay для мобильных и десктопа (когда сайдбар открыт) */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:bg-opacity-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-lg
        `}
      >
        <div className="p-4 flex-shrink-0 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Категории</h2>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <button
                  onClick={() => handleStartAdd(null)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Добавить категорию"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {showAddForm && addingToParent === null && (
            <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Название категории"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAdd();
                  if (e.key === 'Escape') handleCancelAdd();
                }}
                autoFocus
              />
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSaveAdd}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <button
            onClick={() => {
              onCategorySelect('all');
              if (window.innerWidth < 1024) {
                onClose?.();
              }
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all font-medium flex items-center space-x-2 ${
              selectedCategory === 'all'
                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Folder className="w-4 h-4 text-blue-500" />
            <span>Все файлы</span>
          </button>

          {topLevelCategories.map((category) => renderCategory(category))}

          {topLevelCategories.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-gray-500 text-sm">
              {isAdmin ? 'Создайте первую категорию' : 'Нет категорий'}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
