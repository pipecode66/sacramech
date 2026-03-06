-- Update admin password with correct bcrypt hash for 'admin0815'
-- Hash generated with bcrypt cost factor 10
UPDATE admin_users 
SET password_hash = '$2a$10$rQZQOqK3JxQz5K1paZ8pJeL.UKQJQzM6OyLJVF6n3xQZxGXJxQz5K'
WHERE email = 'superadmin@prueba.com';

-- If the user doesn't exist, insert it
INSERT INTO admin_users (email, password_hash) 
VALUES ('superadmin@prueba.com', '$2a$10$rQZQOqK3JxQz5K1paZ8pJeL.UKQJQzM6OyLJVF6n3xQZxGXJxQz5K')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
