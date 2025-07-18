export function getFirstElement<T>(array: T[] | undefined): T | undefined {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }

  return array[0];
}
