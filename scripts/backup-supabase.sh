#!/bin/bash
# IronForge Production Backup Script
# Runs nightly via cron to backup Supabase Postgres to Hetzner Storage Box
# Usage: 0 3 * * * /root/scripts/backup-supabase.sh

set -euo pipefail

# ── Configuration ────────────────────────────────────────
BACKUP_DIR="/tmp/ironforge-backups"
RETENTION_DAYS=7
DB_CONTAINER="supabase-db-kwoc4w4go0sokc4o48g8wows"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ironforge_${TIMESTAMP}.sql.gz"

# ── Create backup directory ──────────────────────────────
mkdir -p "${BACKUP_DIR}"

# ── Dump database ────────────────────────────────────────
echo "[$(date)] Starting backup of ${DB_CONTAINER}..."
docker exec "${DB_CONTAINER}" pg_dump -U postgres --clean --if-exists | gzip > "${BACKUP_FILE}"

# ── Verify backup ────────────────────────────────────────
if [ -s "${BACKUP_FILE}" ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date)] ✅ Backup created: ${BACKUP_FILE} (${SIZE})"
else
    echo "[$(date)] ❌ Backup file is empty or failed!"
    exit 1
fi

# ── Cleanup old backups ──────────────────────────────────
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "ironforge_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# ── Report ───────────────────────────────────────────────
REMAINING=$(ls -1 "${BACKUP_DIR}"/ironforge_*.sql.gz 2>/dev/null | wc -l)
echo "[$(date)] 📦 Backup complete. ${REMAINING} backups retained."
