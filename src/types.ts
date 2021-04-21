export type DiscUnionType<TypeKey extends string> = { [M in TypeKey]: string };

export type Constructor = (...args: any[]) => object;
export type Constructors = Record<string, Constructor>;

export type WithType<T extends object, K extends string, TypeKey extends string> = Omit<T, TypeKey> & { [M in TypeKey]: K };

/**
 * Takes an object of type constructors, and returns a discriminated
 * union based on their return types
 * @param T - an object of type constructors (usually the return of discUnion)
 */
export type DiscUnionOf<
  T extends Record<string, (...args: any[]) => object>
> = ReturnType<T[keyof T]>;

/**
 * Takes any discriminated union, and narrows the type based
 * on the key
 * @param T - any discriminated union
 * @param K - the name(s) of the types to narrow to
 * @param TypeKey - the name of the discriminant property - defaults to 'type'
 */
export type Narrow<
  T extends DiscUnionType<TypeKey>,
  K extends string,
  TypeKey extends string = "type"
> = Extract<T, { [M in TypeKey]: K }>;

/**
 * Takes any discriminated union, and excludes the type of the provided key
 * @param T - any discriminated union
 * @param K - the name(s) of the types to narrow to
 * @param TypeKey - the name of the discriminant property - defaults to 'type'
 */
export type Without<
  T extends DiscUnionType<TypeKey>,
  K extends string | number | symbol,
  TypeKey extends string = "type"
> = Exclude<T, { [M in TypeKey]: K }>;

/**
 * Takes any discriminated union, and returns all possible
 * type names as a union of strings
 * @param T - any discriminated union
 * @param TypeKey - the name of the discriminant property - defaults to 'type'
 */
export type Keys<
  T extends DiscUnionType<TypeKey>,
  TypeKey extends string = "type"
> = T[TypeKey];

export type ConstructorsWithType<
  T extends Constructors,
  TypeKey extends string = "type",
  Prefix extends string = '',
> = {
  [K in keyof T]: {
    <R extends ReturnType<T[K]>>(
      ...args: Parameters<T[K]>
    ): WithType<R, `${Prefix}${Extract<K, string>}`, TypeKey>;
  } & ConstructorExtras<`${Prefix}${Extract<K, string>}`, TypeKey>
};

export type Handlers<
  T extends DiscUnionType<TypeKey>,
  R,
  TypeKey extends string = "type"
> = {
  [K in T[TypeKey]]: (s: Narrow<T, K, TypeKey>) => R;
};

export type ConstructorExtras<
  K extends string,
  TypeKey extends string = 'type',
> = {
  key: K,
  is: <T extends DiscUnionType<TypeKey>>(obj: T) =>  obj is Narrow<T, K, TypeKey>;
  map: <T extends DiscUnionType<TypeKey>, R>(obj: T, mapper: (val: Narrow<T, K , TypeKey>) => R) => R | T;
  validate: <T extends DiscUnionType<TypeKey>>(obj: T) => Narrow<T, K, TypeKey>;
  get: {
    <T extends DiscUnionType<TypeKey>>(obj: Narrow<T, K, TypeKey>): Narrow<T, K, TypeKey>;
    <T extends DiscUnionType<TypeKey>>(obj: T): Narrow<T, K, TypeKey> | null;
  },
}
