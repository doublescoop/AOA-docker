-- This script is run automatically against the 'aoa_dev' database.
-- The user 'aoa_app' should already exists and owns this database.

-- Grant schema privileges to the app user.
GRANT USAGE, CREATE ON SCHEMA public TO aoa_app;

-- Grant table and sequence privileges.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aoa_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aoa_app;

-- Ensure future tables and sequences created by any user (e.g., a superuser during a migration)
-- will also have permissions granted to the app user automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aoa_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aoa_app;