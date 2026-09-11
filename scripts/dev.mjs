import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");

const processes = [
  spawn(process.execPath, [path.join(root, "server", "server.js")], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "development", API_PORT: process.env.API_PORT || "4174" },
    stdio: "inherit",
  }),
  spawn(process.execPath, [viteBin, "--host", "127.0.0.1"], {
    cwd: root,
    env: { ...process.env },
    stdio: "inherit",
  }),
];

function stopAll() {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}
