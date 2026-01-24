#!/bin/bash
# ============================================
# Pilareta Tribe - Database Backup Script
# ============================================
# Creates a timestamped backup of the PostgreSQL database.
#
# Usage: ./backup-db.sh
#
# Recommended: Add to crontab for daily backups
#   0 2 * * * /var/www/pilareta-tribe/server/backup-db.sh
# ============================================

set -e

# Configuration
DB_NAME="pilareta_tribe"
DB_USER="tribe"
BACKUP_DIR="/var/backups/pilareta-tribe"
RETENTION_DAYS=30

# Timestamp for filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Database Backup${NC}"
echo -e "${YELLOW}========================================${NC}"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${GREEN}Creating backup directory...${NC}"
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown ec2-user:ec2-user "$BACKUP_DIR"
fi

# Create backup
echo -e "${GREEN}Creating backup: $BACKUP_FILE${NC}"
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"

# Compress the backup
echo -e "${GREEN}Compressing backup...${NC}"
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}Backup created: $BACKUP_FILE ($SIZE)${NC}"

# Clean up old backups
echo -e "${GREEN}Cleaning up backups older than $RETENTION_DAYS days...${NC}"
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List recent backups
echo -e "\n${YELLOW}Recent backups:${NC}"
ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null | tail -5 || echo "No backups found"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
