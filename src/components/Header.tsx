import { Plus, Search, User, Menu, X } from 'lucide-react';
import type { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  onCreateClick: () => void;
  onProfileClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Header({ 
  user, 
  onCreateClick, 
  onProfileClick, 
  searchQuery, 
  onSearchChange,
  onMenuToggle,
  isMenuOpen = false
}: HeaderProps) {
  const canCreate = user?.role === 'admin';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип и название */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Меню"
                title={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ArtecoBase</h1>
                <p className="text-xs text-gray-500 hidden md:block">База знаний производства</p>
              </div>
            </div>
          </div>
          
          {/* Поиск и действия */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-xl mx-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm"
              />
            </div>
            
            {canCreate && (
              <button
                onClick={onCreateClick}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Создать</span>
              </button>
            )}

            {/* Мобильная кнопка создания */}
            {canCreate && (
              <button
                onClick={onCreateClick}
                className="sm:hidden p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                aria-label="Создать"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Профиль пользователя */}
          {user && (
            <button
              onClick={onProfileClick}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Профиль"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300 group-hover:border-gray-400 transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user.email}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
