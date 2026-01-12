import type { Category } from '../types';

// Категории файлов для базы знаний
export const categories: Category[] = [
  {
    id: 'materials',
    name: 'Материалы',
    icon: '📦',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'furniture',
    name: 'Фурнитура',
    icon: '🔩',
    color: 'bg-green-100 text-green-700',
  },
  {
    id: 'order-forms',
    name: 'Бланки заказа',
    icon: '📋',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'production',
    name: 'Производство',
    icon: '🏭',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'other',
    name: 'Прочее',
    icon: '📁',
    color: 'bg-gray-100 text-gray-700',
  },
];
