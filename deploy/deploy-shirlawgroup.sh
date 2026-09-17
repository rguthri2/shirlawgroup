#!/bin/bash
set -e
SITE_DIR=/home/123techgroup.dev/public_html/shirlawgroup
SITE_OWNER=techg2197

cd "$SITE_DIR"
git fetch origin main
git reset --hard origin/main
chown -R "$SITE_OWNER:$SITE_OWNER" "$SITE_DIR"
find "$SITE_DIR" -type d -exec chmod 755 {} \;
find "$SITE_DIR" -type f -exec chmod 644 {} \;
echo "Deployed $(git rev-parse --short HEAD) at $(date)"
