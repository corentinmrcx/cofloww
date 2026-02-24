FROM php:8.3-cli AS base

# Dépendances système + extensions PHP
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev libpng-dev libzip-dev libxml2-dev libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring bcmath pcntl zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

# ─── Dev ──────────────────────────────────────────────────────────────────────
# Le code source est monté via un volume, pas copié dans l'image.
FROM base AS dev
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ─── Prod ─────────────────────────────────────────────────────────────────────
FROM base AS prod
COPY . .
RUN composer install --no-dev --optimize-autoloader \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
