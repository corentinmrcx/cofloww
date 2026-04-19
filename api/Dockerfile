FROM dunglas/frankenphp:php8.3 AS base

# Outils système (git, zip… pour Composer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl zip unzip \
    && rm -rf /var/lib/apt/lists/*

# install-php-extensions gère les libs système automatiquement
RUN install-php-extensions pdo_pgsql mbstring bcmath pcntl zip gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

# ─── Dev ──────────────────────────────────────────────────────────────────────
# Code monté via volume, php artisan serve sur le port 8000
FROM base AS dev
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ─── Prod ─────────────────────────────────────────────────────────────────────
FROM base AS prod

COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Caddyfile (layer stable)
COPY Caddyfile /etc/caddy/Caddyfile

# Dépendances Composer — couche mise en cache tant que composer.lock ne change pas
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Code source
COPY . .

RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs storage/app/public bootstrap/cache resources/views \
    && chmod -R 775 storage bootstrap/cache \
    && composer dump-autoload --no-dev --optimize --classmap-authoritative --no-scripts

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
