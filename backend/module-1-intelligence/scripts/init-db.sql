-- Database initialization script
-- Runs on Docker PostgreSQL container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lacasa_intelligence TO lacasa;

-- Set timezone
SET timezone TO 'UTC';

-- Set default search path
SET search_path TO public;
