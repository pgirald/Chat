export function getKeys<T extends { [key: string]: any }>(
  obj: T,
): { [prop in keyof T]: string } {
  const keys = {} as { [prop in keyof T]: string };
  for (const key in obj) {
    keys[key] = key;
  }
  return keys;
}
