import {
  DiscUnionType,
  ConstructorsWithType,
  ObjKey,
  Constructors,
  Narrow,
  ConstructorExtras,
  Handlers,
  WithType,
  Without,
} from './types';

/**
 * Factory function that creates the disc-union functions. Use this
 * to have a different default discriminant than 'type'
 * @param factoryTypeKey - The default discriminant property of the functions
 */
export const factory = <FactoryTypeKey extends string>(
  factoryTypeKey: FactoryTypeKey
) => {

  function match<
    T extends DiscUnionType<TypeKey>,
    R extends Handlers<T, unknown, TypeKey>,
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    value: T,
    // We can get better error messages by defaulting to Handlers instead of R when invalid
    handlers: Handlers<T, unknown, TypeKey> extends R ? R : Handlers<T, unknown, TypeKey>,
    typeKey?: TypeKey
  ): (R extends Handlers<T, infer RT, TypeKey> ? RT : never);
  function match<
    T extends DiscUnionType<TypeKey>,
    R extends Partial<Handlers<T, unknown, TypeKey>>,
    E,
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    value: T,
    handlers: Handlers<T, unknown, TypeKey> extends R ? R : Partial<Handlers<T, unknown, TypeKey>>,
    otherwise: (value: Without<T, keyof R, TypeKey>) => E,
    typeKey?: TypeKey
  ): (R extends Partial<Handlers<T, infer RT, TypeKey>> ? RT : never) | E;
  function match<
    T extends DiscUnionType<TypeKey>,
    R extends Partial<Handlers<T, unknown, TypeKey>>,
    E,
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    value: T,
    handlers: Handlers<T, unknown, TypeKey> extends R ? R : Partial<Handlers<T, unknown, TypeKey>>,
    ot: (value: Without<T, keyof R, TypeKey>) => E,
    tk?: TypeKey
  ) {
    let typeKey: TypeKey;
    let otherwise: (value: Without<T, keyof R, TypeKey>) => E;
    if (typeof ot === "function") {
      otherwise = ot;
      typeKey = tk ?? (factoryTypeKey as TypeKey);
    } else {
      typeKey = ot ?? (factoryTypeKey as TypeKey);
    }

    const handler = handlers[value[typeKey]];

    return handler ? handler(
      value as any
    ) : otherwise!(value as any);
  }

  const is = <
    T extends DiscUnionType<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    value: T,
    typeKey = factoryTypeKey as TypeKey
  ): value is Narrow<T, K, TypeKey> => value[typeKey] === type;

  function discUnion<
    T extends Constructors,
    P extends string = '',
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    constructors: T,
    typeKey = factoryTypeKey as TypeKey,
    prefix = '' as P,
  ): ConstructorsWithType<T, TypeKey, P> {
    const constructorsWithType: Record<ObjKey, Function & { key?: ObjKey }> = {};

    for (const key in constructors) {
      const fullKey = prefix + key;

      constructorsWithType[key] = attachExtras(
        (...args: any[]) => createType(fullKey, constructors[key](...args), typeKey),
        fullKey,
        typeKey
      ) 
    }

    const symbols = Object.getOwnPropertySymbols?.(constructors) ?? [];
    symbols.forEach(symbol => {
      constructorsWithType[symbol as any] = attachExtras(
        (...args: any[]) => createType(symbol, constructors[symbol as any](...args), typeKey),
        symbol,
        typeKey
      ) 
    });

    return constructorsWithType as ConstructorsWithType<T, TypeKey, P>;
  };

  const createType = <
    T extends ObjKey,
    O extends object,
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    type: T,
    obj: O,
    typeKey = factoryTypeKey as TypeKey
  ) => ({ ...obj, [typeKey]: type } as WithType<O, T, TypeKey>);

  const validate = <
    T extends DiscUnionType<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    obj: T,
    typeKey = factoryTypeKey as TypeKey
  ) => {
    if (is(type, obj, typeKey)) return obj;
    else
      throw new Error(
        formatError(type.toString(), obj[typeKey].toString())
      );
  };

  function get<
    T extends DiscUnionType<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends ObjKey = FactoryTypeKey
  >(
    type: K,
    obj: Narrow<T, K, TypeKey>,
    typeKey?: TypeKey
  ): Narrow<T, K, TypeKey>;
  function get<
    T extends DiscUnionType<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(type: K, obj: T, typeKey?: TypeKey): Narrow<T, K, TypeKey> | null;
  function get<
    T extends DiscUnionType<TypeKey>,
    K extends T[TypeKey],
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    obj: T,
    typeKey = factoryTypeKey as TypeKey
  ): Narrow<T, K, TypeKey> | null {
    if (is(type, obj, typeKey)) return obj;
    else return null;
  }

  const map = <
    T extends DiscUnionType<TypeKey>,
    K extends T[TypeKey],
    R,
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(
    type: K,
    obj: T,
    mapper: (o: Narrow<T, K, TypeKey>) => R,
    typeKey = factoryTypeKey as TypeKey
  ) => {
    if (is(type, obj, typeKey)) return mapper(obj);
    else return obj;
  };

  const attachExtras = <
    Fn extends (args: unknown[]) => DiscUnionType<TypeKey>, 
    K extends ObjKey,
    TypeKey extends ObjKey | FactoryTypeKey = FactoryTypeKey
  >(fn: Fn, type: K, typeKey = factoryTypeKey as TypeKey): Fn & ConstructorExtras<K, TypeKey> => {
    const extras : ConstructorExtras<K, TypeKey> = {
      key: type as K,
      is<T extends DiscUnionType<TypeKey>>(obj: T): obj is Narrow<T, K, TypeKey> {
        return (obj[typeKey] as ObjKey) === type;
      },
      map<T extends DiscUnionType<TypeKey>, R>(obj: T, mapper: (val: Narrow<T, K, TypeKey>) => R): T | R {
        return extras.is(obj) ? mapper(obj) : obj;
      },
      get<T extends DiscUnionType<TypeKey>>(obj: T): Narrow<T, K, TypeKey> | null {
        return extras.is(obj) ? obj : null;
      },
      validate<T extends DiscUnionType<TypeKey>>(obj: T): Narrow<T, K, TypeKey> {
        if (extras.is(obj)) return obj;
        else
          throw new Error(
            formatError(type.toString(), obj[typeKey].toString())
          );
        },
    }

    return Object.assign(fn, extras);
  }

  return {
    discUnion,
    match,
    map,
    get,
    is,
    validate,
    createType,
    attachExtras
  };
};