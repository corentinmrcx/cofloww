set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"

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

echo "▶ Démarrage de la base de données..."
$COMPOSE up -d db
echo ""

echo "▶ Attente de la base de données..."
$COMPOSE run --rm api bash -c "
  until php -r \"new PDO('pgsql:host=db;dbname=\${DB_DATABASE}', '\${DB_USERNAME}', '\${DB_PASSWORD}');\" 2>/dev/null; do
    echo '  En attente...'
    sleep 2
  done
  echo '  BDD prête !'
"
echo ""

echo "▶ Migrations Laravel..."
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
