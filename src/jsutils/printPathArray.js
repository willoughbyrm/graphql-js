/**
 * Build a string describing the path.
 */
export function printPathArray(path: $ReadOnlyArray<string | number>): string {
  if (path.length === 0) {
    return '';
  }
  return ` at ${path
    .map((key) => (typeof key === 'number' ? `[${key}]` : `.${key}`))
    .join('')}`;
}
