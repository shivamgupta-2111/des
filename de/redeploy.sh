#!/usr/bin/env bash
# Run on the server from the libredesk folder:   ./redeploy.sh
# Backs up the database + uploads, rebuilds from the source in this folder, restarts.
# Data lives in Docker volumes / ./uploads, so it survives the rebuild.
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p backups
STAMP=$(date +%F-%H%M)

echo "-> Backing up database and uploads..."
docker exec libredesk_db pg_dump -U "${POSTGRES_USER:-libredesk}" "${POSTGRES_DB:-libredesk}" > "backups/db-$STAMP.sql"
if [ -d uploads ]; then tar czf "backups/uploads-$STAMP.tar.gz" uploads; fi

if [ -d .git ]; then
  echo "-> Pulling latest code..."
  git pull --ff-only
else
  echo "-> No git repo here: using the files already in this folder (upload your changes first)."
fi

echo "-> Rebuilding and restarting (database migrations run automatically)..."
docker compose up -d --build

echo "-> Status:"
docker compose ps
echo "Logs: docker compose logs -f app"
