export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatMomentDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function groupByDate<T extends { createdAt: string }>(
  items: T[]
): Array<{ label: string; isoDate: string; items: T[] }> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const label = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }
  return Array.from(map.entries()).map(([label, grouped]) => ({
    label,
    isoDate: grouped[0].createdAt,
    items: grouped,
  }));
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

export function resurfaceLabel(yearsAgo: number): string {
  if (yearsAgo === 1) return 'One year ago today';
  if (yearsAgo === 2) return 'Two years ago today';
  if (yearsAgo === 3) return 'Three years ago today';
  return `${yearsAgo} years ago today`;
}
