#!/bin/sh
set -e

cd /var/www/html

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# Run migrations
php artisan migrate --force

# Clear & cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Create supervisor log dir
mkdir -p /var/log/supervisor

exec "$@"
