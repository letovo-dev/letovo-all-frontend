export const nonNegativeCount = (value: unknown): number => {
  const count = Number(value ?? 0);
  if (!Number.isFinite(count)) {
    return 0;
  }
  return Math.max(count, 0);
};

export const applySocialCountDelta = (value: unknown, delta: number): string =>
  String(Math.max(nonNegativeCount(value) + delta, 0));

export const normalizeSocialCounters = <T extends { likes?: unknown; dislikes?: unknown }>(
  item: T,
): T =>
  ({
    ...item,
    likes: String(nonNegativeCount(item.likes)),
    dislikes: String(nonNegativeCount(item.dislikes)),
  }) as T;
