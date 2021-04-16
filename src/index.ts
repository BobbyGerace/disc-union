export type DiscUnionBase<TypeKey extends string> = { [M in TypeKey]: string };

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
export type SingleType<
  T extends DiscUnionBase<TypeKey>,
  K extends T[TypeKey],
  TypeKey extends string = "type"
> = Extract<T, { [M in TypeKey]: K }>;

/**
 * Takes any discriminated union, and returns all possible
 * type names as a union of strings
 * @param T - any discriminated union
 * @param TypeKey - the name of the discriminant property - defaults to 'type'
 */
export type Keys<
  T extends DiscUnionBase<TypeKey>,
  TypeKey extends string = "type"
> = T[TypeKey];

export type ConstructorsWithType<
  T extends Constructors,
  TypeKey extends string = "type"
> = {
  [K in keyof T]: <R extends ReturnType<T[K]>>(
    ...args: Parameters<T[K]>
  ) => WithType<R, Extract<K, string>, TypeKey>;
};

export type Handlers<
  T extends DiscUnionBase<TypeKey>,
  R,
  TypeKey extends string = "type"
> = {
  [K in T[TypeKey]]: (s: SingleType<T, K, TypeKey>) => R;
};

/**
 * Factory function that creates the disc-union functions. Use this
 * to have a different default discriminant than 'type'
 * @param factoryTypeKey - The default discriminant property of the functions
 */
export const factory = <FactoryTypeKey extends string>(
  factoryTypeKey: FactoryTypeKey
) => {

  function match<
    T extends DiscUnionBase<TypeKey>,
    R extends Handlers<T, unknown, TypeKey>,
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    value: T,
    handlers: R,
    typeKey?: TypeKey
  ): R extends Handlers<T, infer RT, TypeKey> ? RT : never;
  function match<
    T extends DiscUnionBase<TypeKey>,
    R extends Partial<Handlers<T, unknown, TypeKey>>,
    E,
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    value: T,
    handlers: R,
    otherwise: (value: Exclude<T, { [M in TypeKey]: keyof R }>) => E,
    typeKey?: TypeKey
  ): (R extends Partial<Handlers<T, infer RT, TypeKey>> ? RT : never) | E;
  function match<
    T extends DiscUnionBase<TypeKey>,
    R extends Partial<Handlers<T, unknown, TypeKey>>,
    E,
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    value: T,
    handlers: R,
    ot?: TypeKey | ((value: Exclude<T, { [M in TypeKey]: keyof R }>) => E),
    tk?: TypeKey
  ) {
    let typeKey: TypeKey;
    let otherwise: (value: Exclude<T, { [M in TypeKey]: keyof R }>) => E;
    if (typeof ot === "function") {
      otherwise = ot;
      typeKey = tk ?? (factoryTypeKey as TypeKey);
    } else {
      typeKey = ot ?? (factoryTypeKey as TypeKey);
    }

    return (
      handlers[value[typeKey] as T[TypeKey]]?.(
        value as Extract<T, { [M in TypeKey]: string }>
      ) ?? otherwise!(value as Exclude<T, { [M in TypeKey]: keyof R }>)
    );
  }

  const is = <
    T extends DiscUnionBase<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    value: T,
    typeKey = factoryTypeKey as TypeKey
  ): value is SingleType<T, K, TypeKey> => value[typeKey] === type;

  const discUnion = <
    T extends Constructors,
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    constructors: T,
    typeKey = factoryTypeKey as TypeKey
  ): ConstructorsWithType<T, TypeKey> => {
    const constructorsWithType: Record<string, Function> = {};

    for (const key in constructors) {
      constructorsWithType[key] = (...args: any[]) =>
        createType(key, constructors[key](...args), typeKey);
    }

    return constructorsWithType as ConstructorsWithType<T, TypeKey>;
  };

  const createType = <
    T extends string,
    O extends object,
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    type: T,
    obj: O,
    typeKey = factoryTypeKey as TypeKey
  ) => ({ ...obj, [typeKey]: type } as WithType<O, T, TypeKey>);

  const validate = <
    T extends DiscUnionBase<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    obj: T,
    typeKey = factoryTypeKey as TypeKey
  ) => {
    if (is(type, obj, typeKey)) return obj;
    else
      throw new Error(
        `Expected object of type "${type}", but got "${obj[typeKey]}"`
      );
  };

  function get<
    T extends DiscUnionBase<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends string = FactoryTypeKey
  >(
    type: K,
    obj: SingleType<T, K, TypeKey>,
    typeKey?: TypeKey
  ): SingleType<T, K, TypeKey>;
  function get<
    T extends DiscUnionBase<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(type: K, obj: T, typeKey?: TypeKey): SingleType<T, K, TypeKey> | null;
  function get<
    T extends DiscUnionBase<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    obj: T,
    typeKey = factoryTypeKey as TypeKey
  ): SingleType<T, K, TypeKey> | null {
    if (is(type, obj, typeKey)) return obj;
    else return null;
  }

  const map = <
    T extends DiscUnionBase<TypeKey>,
    K extends T[TypeKey],
    R,
    TypeKey extends string | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    obj: T,
    mapper: (o: SingleType<T, K, TypeKey>) => R,
    typeKey = factoryTypeKey as TypeKey
  ) => {
    if (is(type, obj, typeKey)) return mapper(obj);
    else return obj;
  };

  return {
    discUnion,
    match,
    map,
    get,
    is,
    validate,
    createType,
  };
};


const fns = factory("type");

/**
 * Accepts an object of constructor functions,
 * and wraps those functions to add a type property
 * to their result
 * 
 * @function
 * @param constructors - Object containing constructors
 * @param typeKey - Discriminant property
 */
export const discUnion = fns.discUnion;

/**
 * Returns the result of mapper if value is of the specified type,
 * otherwise returns the value unchanged
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to map over
 * @param mapper - Function to be called on obj
 * @param typeKey - Discriminant property
 */
export const map = fns.map;

/**
 * Takes an object to match, and an object of handlers whose
 * keys are the possible types of the discriminated union.
 * 
 * Exhaustive unless an "otherwise" handler is passed in as a third argument,
 * in which case the handler object may be partial.
 * 
 * @function
 * @param obj - Object to match
 * @param handlers - Object whose keys are possible types of the discriminated union, and whose values are handlers for those types
 * @param otherwise (optional) - Handler if no match is found
 * @param typeKey (optional) - Discriminant property
 * @returns Result of the matched handler, or the result of the "otherwise" handler
 */
export const match = fns.match;

/**
 * Narrows the type of the value if it matches the specified type,
 * otherwise returns null
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to get
 * @param typeKey - Discriminant property
 */
export const get = fns.get;

/**
 * Determines if the value matches the specified type
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to check
 * @param typeKey - Discriminant property
 */
export const is = fns.is;

/**
 * Narrows the type of the value if it matches, throws
 * an error otherwise
 * 
 * @function
 * @param type - Type to match
 * @param obj - Value to check
 * @param typeKey - Discriminant property
 */
export const validate = fns.validate;

/**
 * Convenience function for adding a type discriminant 
 * to an object
 * 
 * @function
 * @param type - Type to create
 * @param obj - Value to use
 * @param typeKey - Discriminant property
 */
export const createType = fns.createType;