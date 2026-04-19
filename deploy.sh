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
$COMPOSE run --rm api php -r "
  \$attempts = 0;
  while (\$attempts < 30) {
      try {
          new PDO('pgsql:host=db;dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
          exit(0);
      } catch (Exception \$e) {
          echo '  En attente de Postgres... \n';
          sleep(2);
          \$attempts++;
      }
  }
  exit(1);
"
echo ""

echo "▶ Migrations et Optimisations Laravel..."
$COMPOSE run --rm api php artisan migrate --force
$COMPOSE run --rm api php artisan storage:link --force
$COMPOSE run --rm api php artisan optimize
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
