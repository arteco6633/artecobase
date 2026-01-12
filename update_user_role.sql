-- Обновление роли пользователя на администратора
-- Замените email на нужный

UPDATE user_profiles
SET role = 'admin'
WHERE email = 'arteco.one@mail.ru';

-- Проверка результата
SELECT id, email, role, created_at
FROM user_profiles
WHERE email = 'arteco.one@mail.ru';
