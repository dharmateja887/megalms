import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(process.cwd());

const children = [
  spawn("python", ["manage.py", "runserver", "127.0.0.1:8000"], {
    cwd: resolve(root, "lms-clone", "backend"),
    shell: true,
    stdio: "inherit",
    env: { ...process.env },
  }),
  spawn("pnpm", ["dev"], {
    cwd: resolve(root, "lms", "apps", "web"),
    shell: true,
    stdio: "inherit",
    env: { ...process.env },
  }),
  spawn("pnpm", ["dev"], {
    cwd: resolve(root, "lms-clone"),
    shell: true,
    stdio: "inherit",
    env: { ...process.env },
  }),
];

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (signal || (typeof code === "number" && code !== 0)) {
      shutdown();
      process.exit(typeof code === "number" ? code : 1);
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
