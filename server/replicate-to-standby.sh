#!/bin/bash
# ============================================
# Pilareta Tribe - Replicate to Standby
# ============================================
# Backs up the primary PostgreSQL database and
# cleans up expired sessions before doing so.
#
# Usage: Add to cron, e.g.:
#   0 2 * * * /var/www/pilareta-tribe/server/replicate-to-standby.sh
# ============================================

set -euo pipefail

LOG_FILE="/var/log/pilareta-replicate.log"
DB_USER="tribe"
DB_NAME="pilareta_tribe"
DB_HOST="localhost"
BACKUP_DIR="/var/backups/pilareta"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Clean up expired sessions
psql -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" -c "DELETE FROM \"Session\" WHERE \"expiresAt\" < NOW();" 2>/dev/null || true
echo "$(date): Cleaned expired sessions" >> "$LOG_FILE"

# Create backup
BACKUP_FILE="$BACKUP_DIR/pilareta_tribe_$(date +%Y%m%d_%H%M%S).sql.gz"
pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" | gzip > "$BACKUP_FILE"
echo "$(date): Backup created at $BACKUP_FILE" >> "$LOG_FILE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
echo "$(date): Old backups cleaned" >> "$LOG_FILE"

echo "$(date): Replication complete" >> "$LOG_FILE"
