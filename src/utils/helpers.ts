export function generateRandomArray(size: number, min = 5, max = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateNearlySortedArray(size: number): number[] {
  const arr = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = 0; i < Math.floor(size * 0.1); i++) {
    const idx1 = Math.floor(Math.random() * size);
    const idx2 = Math.floor(Math.random() * size);
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  }
  return arr;
}

export function generateReverseSortedArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => size - i);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function measureExecutionTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, time: end - start };
}

export function formatTime(ms: number): string {
  if (ms < 0.001) return `${(ms * 1000000).toFixed(2)} ns`;
  if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(4)} s`;
}
