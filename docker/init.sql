-- ===================================================================
-- Deshi Commerce PostgreSQL Initialization Script
-- ===================================================================

-- Ensure UTF8 encoding & timezone
SET timezone = 'Asia/Dhaka';

-- Enable cryptographic & UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Notice of successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Deshi Commerce database initialized successfully with Asia/Dhaka timezone and UUID extensions.';
END $$;
