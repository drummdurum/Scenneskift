-- Run this SQL in Railway PostgreSQL console to reset drumm password to 'drumm123'
-- Hash for 'drumm123': $2a$10$iSpgYMrRH60b.cuUIIoLjuiAnlK4IvD7RADc3LfTWGNQJlWfCwSuW

UPDATE brugere 
SET password = '$2a$10$iSpgYMrRH60b.cuUIIoLjuiAnlK4IvD7RADc3LfTWGNQJlWfCwSuW'
WHERE brugernavn = 'drumm';

-- Verificér at det virkede
SELECT brugernavn, rolle, aktiv FROM brugere WHERE brugernavn = 'drumm';
