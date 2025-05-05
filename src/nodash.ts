export function orderBy<T>(
  collection: readonly T[],
  iteratees: ((value: T) => any)[],
  orders: ("asc" | "desc")[],
): T[] {
  const result = [...collection];
  result.sort((a, b) => {
    for (let i = 0; i < iteratees.length; i++) {
      const iteratee = iteratees[i]!;
      const order = orders[i];
      const aValue = iteratee(a);
      const bValue = iteratee(b);
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
    }
    return 0;
  });
  return result;
}

export function groupBy<T>(
  collection: readonly T[],
  iteratee: (value: T) => string,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of collection) {
    const key = iteratee(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}
