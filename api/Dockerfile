FROM php:8.3-cli AS base

RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev libpng-dev libzip-dev libxml2-dev libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring bcmath pcntl zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

# ─── Dev ──────────────────────────────────────────────────────────────────────
FROM base AS dev
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ─── Prod ─────────────────────────────────────────────────────────────────────
FROM base AS prod

# Entrypoint (layer stable, mis en cache en premier)
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Dépendances Composer — couche mise en cache tant que composer.lock ne change pas
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Code source
COPY . .

# Autoload optimisé + répertoires Laravel requis
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative \
    && mkdir -p storage/framework/{sessions,views,cache} bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

ENTRYPOINT ["entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
