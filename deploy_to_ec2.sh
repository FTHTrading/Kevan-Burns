#!/bin/bash
set -e

KEY_PATH=~/.ssh/unykorn-besu-l1-key.pem
SERVER=ubuntu@18.209.240.66
REMOTE_DIR=/home/ubuntu/legacy-vault-protocol

echo "=== Syncing entire codebase to EC2 via rsync ==="
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i $KEY_PATH" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.vercel' \
  --exclude='.wrangler' \
  --exclude='tsconfig.tsbuildinfo' \
  --exclude='next-build*.tar.gz' \
  --exclude='.env*' \
  /mnt/c/Users/Kevan/legacy-vault-protocol/ \
  "$SERVER:$REMOTE_DIR/"

echo "=== Applying database configuration corrections and schema migrations on remote EC2 ==="
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$SERVER" "
  cd $REMOTE_DIR
  
  # Correct the database port in remote .env if it exists and uses 5433
  if [ -f .env ]; then
    echo 'Correcting database port from 5433 to 5432 in remote .env...'
    sed -i 's/localhost:5433/localhost:5432/g' .env
  fi

  echo 'Running pnpm install...'
  pnpm install --ignore-scripts

  echo 'Pushing database schema updates to PostgreSQL...'
  npx prisma db push --accept-data-loss

  echo 'Restarting PM2 clusters...'
  pm2 restart all
  
  echo 'PM2 status:'
  pm2 list
"

echo "=== DIRECT EC2 DEPLOYMENT SUCCESSFUL ==="
