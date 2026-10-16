import { spawn } from "node:child_process";
const children = [
  spawn(process.execPath, ["server.mjs"], { stdio: "inherit" }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
    stdio: "inherit",
  }),
];
for (const c of children)
  c.on("exit", () => {
    for (const other of children) other.kill();
  });
process.on("SIGINT", () => {
  for (const c of children) c.kill();
});
