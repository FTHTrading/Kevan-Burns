#!/usr/bin/env node
// Build wrapper — sets NODE_OPTIONS before spawning Next.js so the flag
// is inherited by all child/worker processes (avoids Windows cmd env-var syntax).
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const nextBin = resolve(__dir, "../node_modules/.bin/next");

process.env.NODE_OPTIONS = "--max-old-space-size=8192";
process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";

const child = spawn(nextBin, ["build"], {
  stdio: "inherit",
  env: { ...process.env },
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
