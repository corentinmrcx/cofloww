#!/bin/sh
set -e

mkdir -p storage/framework/{sessions,views,cache} storage/logs storage/app/public

php artisan package:discover --ansi
php artisan config:cache
php artisan route:cache

exec "$@"
