/**
 * Formats a value/total ratio as a percentage string.
 * Example:
 *   formatPercent(25, 100)  -> "25.0%"
 *   formatPercent(1, 3)     -> "33.3%"
 *   formatPercent(0, 0)     -> "0%"
 *   formatPercent(0.256)    -> "25.6%"
 */
export function formatPercent(
  value: number,
  total?: number,
  decimals = 1
): string {
  if (total === undefined) {
    // interpret value as ratio (0–1)
    return `${(value * 100).toFixed(decimals)}%`;
  }
  if (total <= 0) return "0%";
  return `${((value / total) * 100).toFixed(decimals)}%`;
}

/**
 * Converts seconds into a human-readable duration string.
 * Examples:
 *   65   -> "1m 5s"
 *   3661 -> "1h 1m 1s"
 *   93784 -> "1d 2h 3m 4s"
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

/**
 * Converts bytes into a human-readable string with appropriate units.
 * Example:
 *   512 -> "512 B"
 *   1048576 -> "1 MB"
 *   3221225472 -> "3 GB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(decimals))} ${units[i]}`;
}
