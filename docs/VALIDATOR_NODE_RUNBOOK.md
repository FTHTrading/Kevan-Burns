# Legacy Layer 0 — Validator Node Runbook

## Overview

This runbook covers deploying, configuring, and operating a Legacy Layer 0 validator node.

> **Status**: Planned — instructions are designed for the production deployment phase.
> The Rust scaffold is at `protocol/layer0/`.

## Prerequisites

- Dedicated server or VM: 4 CPU cores, 8 GB RAM, 500 GB SSD minimum
- Ubuntu 22.04 LTS or Debian 12 (recommended)
- Rust toolchain: `rustup` stable
- Open ports: 30333 (P2P), 9944 (RPC)
- Domain/IP with TLS cert for gateway nodes

## Initial Setup

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Clone repository
git clone https://github.com/FTHTrading/Legacy.git
cd Legacy/protocol/layer0

# 3. Build node binary
cargo build --release --bin legacy-layer0-node

# 4. Create data directory
sudo mkdir -p /var/lib/legacy-layer0
sudo chown $(whoami) /var/lib/legacy-layer0
```

## Configuration

Create `/etc/legacy/node.toml`:

```toml
[node]
type = "validator"
name = "legacy-validator-1"
data_dir = "/var/lib/legacy-layer0"

[network]
listen_addr = "/ip4/0.0.0.0/tcp/30333"
bootnodes = []          # Add genesis bootnode address here

[rpc]
port = 9944
host = "127.0.0.1"     # Use nginx/caddy for TLS termination
cors = ["https://your-app-domain.com"]

[chain]
genesis = "/etc/legacy/genesis.json"

[validator]
key_file = "/etc/legacy/validator.key"
```

## Key Generation

```bash
# Generate validator keypair
./target/release/legacy-layer0-node key generate \
  --output /etc/legacy/validator.key

# Print public key (register this with the network)
./target/release/legacy-layer0-node key inspect \
  --key-file /etc/legacy/validator.key
```

## Starting the Node

```bash
# Start validator
./target/release/legacy-layer0-node \
  --config /etc/legacy/node.toml \
  2>&1 | tee /var/log/legacy-node.log
```

## Systemd Service

```ini
[Unit]
Description=Legacy Layer 0 Validator Node
After=network.target

[Service]
Type=simple
User=legacy
WorkingDirectory=/var/lib/legacy-layer0
ExecStart=/usr/local/bin/legacy-layer0-node --config /etc/legacy/node.toml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable legacy-node
sudo systemctl start legacy-node
sudo systemctl status legacy-node
```

## Monitoring

```bash
# Check block height
curl -s http://localhost:9944 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"chain_getBlockHeight","id":1}'

# Check peer count
curl -s http://localhost:9944 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"system_peerCount","id":1}'

# Check sync status
curl -s http://localhost:9944 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"system_syncState","id":1}'
```

## Key Rotation

Validator keys should be rotated annually or when compromised:

```bash
# Generate new key
./legacy-layer0-node key generate --output /etc/legacy/validator-new.key

# Submit rotation transaction via governance (requires stake)
./legacy-layer0-node key rotate \
  --old /etc/legacy/validator.key \
  --new /etc/legacy/validator-new.key \
  --rpc http://localhost:9944

# After rotation is confirmed on-chain
mv /etc/legacy/validator.key /etc/legacy/validator.key.bak
mv /etc/legacy/validator-new.key /etc/legacy/validator.key
```

## Backup

```bash
# Backup data directory
rsync -av --progress /var/lib/legacy-layer0/ /backup/legacy-layer0-$(date +%Y%m%d)/

# Backup key file (store encrypted, off-site)
gpg --symmetric /etc/legacy/validator.key
```

## See Also

- `LAYER0_OVERVIEW.md` — protocol overview
- `LAYER0_RUST_ARCHITECTURE.md` — architecture details
- `protocol/layer0/node/README.md` — node binary design
