/** Parse ISO string hoặc mảng LocalDateTime từ Spring [y,m,d,h,mi,s] */
export function parseApiDate(value: unknown): number {
  if (value == null) return 0;

  if (typeof value === "string") {
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, mi = 0, s = 0] = value as number[];
    const t = new Date(y, m - 1, d, h, mi, s).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  return 0;
}
