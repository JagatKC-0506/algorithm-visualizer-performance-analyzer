export function generateRandomArray(size: number, min = 5, max = 100): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(size, pool.length));
}

export function generateNearlySortedArray(size: number, min = 5, max = 100): number[] {
  const base = generateRandomArray(size, min, max).sort((a, b) => a - b);
  const swaps = Math.max(1, Math.floor(size * 0.15));
  for (let i = 0; i < swaps; i++) {
    const idx1 = Math.floor(Math.random() * size);
    const idx2 = Math.floor(Math.random() * size);
    [base[idx1], base[idx2]] = [base[idx2], base[idx1]];
  }
  return base;
}

export function generateReverseSortedArray(size: number, min = 5, max = 100): number[] {
  return generateRandomArray(size, min, max).sort((a, b) => b - a);
}

export function generateSortedArray(size: number, min = 5, max = 100): number[] {
  return generateRandomArray(size, min, max).sort((a, b) => a - b);
}


