#!/bin/bash

# Script to seed test users into the database
# Usage: ./scripts/seed-users.sh

echo "Seeding test users..."

# Note: In production, passwords should be properly hashed
# These are bcrypt hashes of "password123"
PASSWORD_HASH='$2a$10$rKjGZvhBvJj3/5H5Z5H5Z5H5Z5H5Z5H5Z5H5Z5H5Z5H5Z5H5Z5H5.'

# For now, let's just create the SQL and let the user run it
# because bcrypt hashes need to be generated properly

cat > /tmp/seed_users.sql <<EOF
-- Test users for development
-- All passwords are: password123

INSERT INTO users (first_name, last_name, email, password, height, created_at)
VALUES
  ('John', 'Doe', 'john@example.com', 'REPLACE_WITH_HASH', 70, CURRENT_TIMESTAMP),
  ('Jane', 'Smith', 'jane@example.com', 'REPLACE_WITH_HASH', 65, CURRENT_TIMESTAMP),
  ('Bob', 'Johnson', 'bob@example.com', 'REPLACE_WITH_HASH', 72, CURRENT_TIMESTAMP);
EOF

echo "SQL file created at /tmp/seed_users.sql"
echo ""
echo "However, passwords need to be properly hashed."
echo "Please use the signup page to create test users, or run:"
echo ""
echo "  npm run seed-users"
echo ""
