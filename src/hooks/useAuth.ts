import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем текущую сессию
    checkUser();

    // Слушаем изменения аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Ошибка проверки пользователя:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Получаем email из auth.users
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Получаем роль из таблицы user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      // Если профиля нет, создаем его с ролью partner по умолчанию
      if (profileError && profileError.code === 'PGRST116') {
        // Профиль не найден, создаем его
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: authUser.email || '',
            role: 'partner',
          });

        if (insertError) {
          console.error('Ошибка создания профиля:', insertError);
        }

        setUser({
          id: userId,
          email: authUser.email || '',
          role: 'partner',
        });
      } else if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError);
        // Устанавливаем роль по умолчанию
        setUser({
          id: userId,
          email: authUser.email || '',
          role: 'partner',
        });
      } else {
        setUser({
          id: userId,
          email: authUser.email || '',
          role: (profile?.role as UserRole) || 'partner',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, _role: UserRole = 'partner') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Если email требует подтверждения, data.session будет null
      // В этом случае профиль будет создан автоматически через триггер в БД
      // После подтверждения email пользователь войдет и получит профиль
      // Примечание: роль всегда будет 'partner' по умолчанию при создании через триггер
      // Роль можно будет изменить администратором позже через SQL или админ-панель
      if (!data.session) {
        // Email требует подтверждения
        return { 
          error: null,
          needsEmailConfirmation: true 
        };
      }

      // Если по какой-то причине подтверждение отключено и сессия есть
      // loadUserData будет вызван автоматически через onAuthStateChange
      if (data.user) {
        await loadUserData(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserData(user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
