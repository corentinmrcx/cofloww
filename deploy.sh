#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml --env-file ./api/.env"

echo ""
echo "╔══════════════════════════════════╗"
echo "║       CoFloww — Déploiement      ║"
echo "╚══════════════════════════════════╝"
echo ""

echo "▶ Récupération du code (git pull)..."
git pull origin main
echo ""

echo "▶ Construction des images Docker..."
$COMPOSE build --pull
echo ""

echo "▶ Démarrage de la base de données et Redis..."
$COMPOSE up -d db redis
echo ""

echo "▶ Migrations Laravel..."
# depends_on service_healthy garantit que db et redis sont prêts avant le lancement
$COMPOSE run --rm api php artisan migrate --force
echo ""

echo "▶ Démarrage de tous les services..."
$COMPOSE up -d
echo ""

echo "▶ Nettoyage des images obsolètes..."
docker image prune -f
echo ""

echo "✓ Déploiement terminé !"
echo ""
$COMPOSE ps
echo ""
