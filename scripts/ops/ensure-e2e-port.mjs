import { execSync } from "node:child_process";

const port = Number(process.env.E2E_PORT || process.env.PORT || 3101);

function getProcessName(pid) {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (!out) return "unknown";
    const parts = out.split(",");
    return parts[0].replace(/"/g, "") || "unknown";
  } catch {
    return "unknown";
  }
}

try {
  if (process.platform === "win32") {
    // Chỉ tìm kiếm các dòng LISTENING có địa chỉ cục bộ kết thúc chính xác bằng :${port}
    const stdout = execSync("netstat -ano", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const lines = stdout.trim().split("\n");
    const portRegex = new RegExp(`:${port}\\s`);
    const pids = new Set();

    for (const line of lines) {
      if (line.includes("LISTENING") && portRegex.test(line)) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && Number(pid) > 0 && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
    }

    for (const pid of pids) {
      const procName = getProcessName(pid);
      console.log(`[ensure-e2e-port] Phát hiện tiến trình ${procName} (PID: ${pid}) chiếm cổng ${port}. Đang giải phóng...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`[ensure-e2e-port] Đã giải phóng cổng ${port} từ tiến trình ${procName} (PID: ${pid})`);
      } catch (err) {
        console.warn(`[ensure-e2e-port] Không thể kill tiến trình ${procName} (PID: ${pid}):`, err.message);
      }
    }
  } else {
    try {
      execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: "ignore" });
    } catch {}
  }
} catch {
  // Cổng đang trống
}
