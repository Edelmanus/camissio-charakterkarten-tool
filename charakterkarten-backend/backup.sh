#!/bin/bash
# Tägliches SQLite-Backup — via Cron aufrufen:
#   0 3 * * * /opt/charakterkarten/charakterkarten-backend/backup.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB="$SCRIPT_DIR/charakterkarten.db"
BACKUP_DIR="$SCRIPT_DIR/backups"
DATE=$(date +%Y-%m-%d)

mkdir -p "$BACKUP_DIR"

# SQLite Online-Backup (konsistent, auch bei laufendem Server)
sqlite3 "$DB" ".backup '$BACKUP_DIR/charakterkarten-$DATE.db'"

# Backups älter als 30 Tage löschen
find "$BACKUP_DIR" -name "charakterkarten-*.db" -mtime +30 -delete

echo "Backup erstellt: $BACKUP_DIR/charakterkarten-$DATE.db"
