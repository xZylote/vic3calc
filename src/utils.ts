type TupleEntry<T extends readonly unknown[], I extends unknown[] = [], R = never> = T extends readonly [infer Head, ...infer Tail]
  ? TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]>
  : R;

// eslint-disable-next-line @typescript-eslint/ban-types
type ObjectEntry<T extends {}> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object ? ({ [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E ? (E extends [infer K, infer V] ? (K extends string | number ? [`${K}`, V] : never) : never) : never) : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Entry<T extends {}> = T extends readonly [unknown, ...unknown[]] ? TupleEntry<T> : T extends Array<infer U> ? [`${number}`, U] : ObjectEntry<T>;

export function entries<T extends {}>(object: T): Array<Entry<T>> {
  return Object.entries(object) as unknown as Array<Entry<T>>;
}

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
