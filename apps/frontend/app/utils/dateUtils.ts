export function formatDateTime(date?: string | Date) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function epochSecondsToDate(epochSeconds?: string | number): Date {
  if (epochSeconds === undefined) {
    throw new Error("Epoch seconds is undefined");
  }

  const timestamp =
    typeof epochSeconds === "string" ? Number(epochSeconds) : epochSeconds;

  if (Number.isNaN(timestamp)) {
    throw new Error("Invalid epoch timestamp");
  }

  return new Date(timestamp * 1000);
}

export function formatDate(date?: string | Date) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date?: string | Date) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
