export function movingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 1) {
    return values.slice();
  }

  const result: number[] = [];
  let sum = 0;
  const queue: number[] = [];

  values.forEach((value, index) => {
    sum += value;
    queue.push(value);

    if (queue.length > windowSize) {
      const removed = queue.shift();
      if (removed !== undefined) {
        sum -= removed;
      }
    }

    const divisor = Math.min(index + 1, windowSize);
    result.push(sum / divisor);
  });

  return result;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
