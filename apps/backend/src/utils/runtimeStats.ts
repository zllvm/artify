import os from "os";
import process from "process";

import { formatBytes, formatDuration, formatPercent } from "@artify/shared";

export default class RuntimeStats {
  static collect() {
    const mem = process.memoryUsage();
    const load = os.loadavg();
    const uptimeSec = Math.round(process.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cores = os.cpus().length;
    const cpu = process.cpuUsage();
    const totalCpuMs = (cpu.user + cpu.system) / 1000;

    // Average CPU usage across all cores since process start
    const avgCpuPercent =
      uptimeSec > 0 ? totalCpuMs / (uptimeSec * 1000) / cores : 0;

    return {
      process: {
        pid: process.pid,
        uptimeSec,
        uptimeHuman: formatDuration(uptimeSec),
        nodeVersion: process.version,
      },
      memory: {
        heapUsed: formatBytes(mem.heapUsed), // actual memory used during the execution
        heapTotal: formatBytes(mem.heapTotal), // total size of the allocated heap by V8
        heapUsagePercent: formatPercent(mem.heapUsed, mem.heapTotal),
        rss: formatBytes(mem.rss), // total memory footprint of the node process in RAM
        rssPercentOfSystem: formatPercent(mem.rss, totalMem),
        external: formatBytes(mem.external), // memory allocated outside V8 heap, used by C++ objects bound to JavaScript objects managed by V8
      },
      cpu: {
        loadAvg1m: load[0], // how busy is the server overall
        loadAvg5m: load[1],
        loadAvg15m: load[2],
        cores: cores,
        cpuAveragePercent: formatPercent(avgCpuPercent),
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        totalMem: formatBytes(os.totalmem()),
        freeMem: formatBytes(os.freemem()),
        usedMem: formatBytes(totalMem - freeMem),
        usedMemPercent: formatPercent(totalMem - freeMem, totalMem),
      },
    };
  }
}
