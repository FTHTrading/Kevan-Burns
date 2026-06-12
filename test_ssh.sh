#!/bin/bash
mkdir -p ~/.ssh
cp /mnt/c/Users/Kevan/.ssh/*.pem ~/.ssh/ 2>/dev/null || true
chmod 600 ~/.ssh/*.pem 2>/dev/null || true

for k in ~/.ssh/*.pem; do
  if [ -f "$k" ]; then
    echo "Testing key: $k"
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=3 -i "$k" ubuntu@44.220.89.151 "echo SUCCESS" 2>&1
  fi
done
