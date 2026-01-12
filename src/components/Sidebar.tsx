import type { CategoryType } from '../types';
import { categories } from '../data/categories';

interface SidebarProps {
  selectedCategory: CategoryType | 'all';
  onCategorySelect: (category: CategoryType | 'all') => void;
}

export function Sidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Категории</h2>
        <nav className="space-y-2">
          <button
            onClick={() => onCategorySelect('all')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            📁 Все файлы
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? `${category.color} font-medium`
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
