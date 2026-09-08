type WithoutUndefined<T> = { [K in keyof T]: Exclude<T[K], undefined> };

export function withoutUndefined<T extends object>(value: T): WithoutUndefined<T> {
  const result = {} as WithoutUndefined<T>;
  for (const key of Object.keys(value) as (keyof T)[]) {
    const propertyValue = value[key];
    if (propertyValue !== undefined) {
      result[key] = propertyValue as WithoutUndefined<T>[typeof key];
    }
  }
  return result;
}
