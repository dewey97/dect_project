import { execSync } from "node:child_process";

const port = Number(process.env.E2E_PORT || process.env.PORT || 3101);

try {
  if (process.platform === "win32") {
    const stdout = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const lines = stdout.trim().split("\n");
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && Number(pid) > 0 && pid !== String(process.pid)) {
        pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`[ensure-e2e-port] Đã giải phóng cổng ${port} từ tiến trình ${pid}`);
      } catch {}
    }
  } else {
    try {
      execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: "ignore" });
    } catch {}
  }
} catch {
  // Cổng đang trống
}
