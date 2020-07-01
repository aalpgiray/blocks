export function round(p: number, n: number) {
  return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
}
