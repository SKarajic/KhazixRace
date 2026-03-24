#!/usr/bin/env bash
set -e

# Create the public/storage symlink on first boot (no-op if it already exists)
php artisan storage:link --force 2>/dev/null || true

exec "$@"
