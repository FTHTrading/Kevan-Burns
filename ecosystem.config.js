module.exports = {
  apps: [
    {
      name: "legacy-web-gateway",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      },
      max_memory_restart: "2G",
      listen_timeout: 8000,
      kill_timeout: 3000
    },
    {
      name: "legacy-vault-worker",
      script: "npx",
      args: "tsx scripts/background-worker.ts",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "400M"
    }
  ]
};
