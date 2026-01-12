import { LogOut, User, Shield, Eye } from 'lucide-react';
import type { User as UserType } from '../types';

interface UserProfileProps {
  user: UserType;
  onLogout: () => Promise<void>;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const handleLogout = async () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      await onLogout();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Личный кабинет</h2>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              {user.role === 'admin' ? (
                <>
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">Администратор</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Партнер</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Роль:</span>
              <span className="text-sm font-medium text-gray-900">
                {user.role === 'admin' ? 'Администратор' : 'Партнер'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Права доступа:</span>
              <span className="text-sm font-medium text-gray-900">
                {user.role === 'admin' 
                  ? 'Полный доступ (редактирование, создание, удаление)' 
                  : 'Только просмотр'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
