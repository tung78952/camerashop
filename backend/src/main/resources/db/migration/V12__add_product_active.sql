-- Soft delete flag: hidden products stay for past orders but are not sold.

ALTER TABLE products ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
