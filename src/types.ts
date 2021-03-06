export type ObjKey = string | symbol;
export type DiscUnionType<TypeKey extends ObjKey> = { [M in TypeKey]: ObjKey };

export type Constructor = (...args: any[]) => object;
export type Constructors = Record<ObjKey, Constructor>;

export type WithType<T extends object, K extends ObjKey, TypeKey extends ObjKey> = Omit<T, TypeKey> & { [M in TypeKey]: K };

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
  K extends ObjKey,
  TypeKey extends ObjKey = "type"
> = Extract<T, { [M in TypeKey]: K }>;

/**
 * Takes any discriminated union, and excludes the type of the provided key
 * @param T - any discriminated union
 * @param K - the name(s) of the types to narrow to
 * @param TypeKey - the name of the discriminant property - defaults to 'type'
 */
export type Without<
  T extends DiscUnionType<TypeKey>,
  K extends ObjKey | number,
  TypeKey extends ObjKey = "type"
> = Exclude<T, { [M in TypeKey]: K }>;

/**
 * Takes any discriminated union, and returns all possible
 * type names as a union of strings
 * @param T - any discriminated union
 * @param TypeKey - the name of the discriminant property - defaults to 'type'
 */
export type Keys<
  T extends DiscUnionType<TypeKey>,
  TypeKey extends ObjKey = "type"
> = T[TypeKey];

export type ConstructorsWithType<
  T extends Constructors,
  TypeKey extends ObjKey = "type",
  Prefix extends string = '',
> = {
  [K in keyof T]: {
    <R extends ReturnType<T[K]>>(
      ...args: Parameters<T[K]>
    ): WithType<R, K extends string ? `${Prefix}${K}` : Extract<K, symbol>, TypeKey>;
  } & ConstructorExtras<K extends string ? `${Prefix}${K}` : Extract<K, symbol>, TypeKey>
};

export type Handlers<
  T extends DiscUnionType<TypeKey>,
  R,
  TypeKey extends ObjKey = "type"
> = {
  [K in T[TypeKey]]: (s: Narrow<T, K, TypeKey>) => R;
};

export type ConstructorExtras<
  K extends ObjKey,
  TypeKey extends ObjKey = 'type',
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
