# Legacy Layer 0 — Node Binary

## Purpose

The `legacy-layer0-node` binary is the executable that runs a Legacy Layer 0 node.
It manages the P2P network, RPC API, block production (for validators), and
connects all runtime crates.

## Status: Planned

## Responsibilities

- Parse CLI arguments and load node configuration (`config.toml`)
- Initialize the P2P networking layer (libp2p planned)
- Start the RPC server (gRPC + JSON-RPC endpoints)
- Start block production loop (validators only)
- Connect to chain storage backend (RocksDB)
- Subscribe to and forward events to observer/archive nodes
- Manage relayer connections for cross-chain routing

## CLI Interface (planned)

```bash
legacy-layer0-node
  --config <path>          Node configuration file
  --node-type <type>       validator | observer | archive | relayer | gateway
  --data-dir <path>        Chain data directory
  --rpc-port <port>        RPC server port (default: 9944)
  --p2p-port <port>        P2P port (default: 30333)
  --bootnodes <addrs>      Comma-separated bootnode multiaddresses
```

## Configuration Format (`config.toml`)

```toml
[node]
type = "validator"
name = "legacy-validator-1"
data_dir = "/var/lib/legacy-layer0"

[network]
listen_addr = "/ip4/0.0.0.0/tcp/30333"
bootnodes = []

[rpc]
port = 9944
cors = ["http://localhost:3000"]

[chain]
genesis = "./genesis.json"

[validator]
key_file = "/etc/legacy/validator.key"
```

## Key Dependencies (planned)

- `libp2p` — P2P networking
- `tokio` — Async runtime
- `rocksdb` — Chain storage
- `tonic` — gRPC server
- `serde_json` — JSON-RPC handling

## See Also

- `../runtime/README.md` — block execution runtime
- `../../docs/VALIDATOR_NODE_RUNBOOK.md` — operator runbook
