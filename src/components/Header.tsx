import { Plus, Search } from 'lucide-react';

interface HeaderProps {
  onCreateClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ onCreateClick, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">ArtecoBase</h1>
            <p className="text-sm text-gray-500 hidden sm:block">База знаний производства</p>
          </div>
          
          <div className="flex items-center space-x-4 flex-1 max-w-md ml-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={onCreateClick}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Создать</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
