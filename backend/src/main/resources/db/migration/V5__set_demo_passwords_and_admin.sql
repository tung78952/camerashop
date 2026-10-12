UPDATE users
SET password_hash = '$2a$10$48UW9ea9YWFyFb4wXmu8vOpyORyiWBJXEbixqoec1jti6FRwE0bfa'
WHERE email = 'demo@camerashop.local';

INSERT INTO users (name, email, password_hash, role)
VALUES ('Quản trị viên', 'admin@camerashop.local',
        '$2a$10$pBm8UNp7rhkY9Rqhf0vDfeCsptKn5yHQ6nmKtedHQVwZSMGA.hrPa', 'ADMIN');
