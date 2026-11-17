export function parseDateOnly(value) {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(value ?? '');
  if (!match) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

