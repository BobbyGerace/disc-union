import { DiscUnionOf, discUnion, createType, get, attachExtras, match, is, validate, map, Narrow } from '../src';

describe('advanced usage', () => {
  it('generic types work', () => {
    const _Option = discUnion({
      none: () => ({}),
    });
    
    type Some<T> = { type: 'some', value: T };
    const some = attachExtras(
      <T>(value: T) => createType('some', { value }),
      'some'
    );
    
    const Option = {
      ..._Option,
      some,
    };
    
    type OptionType<T> = DiscUnionOf<typeof _Option> | Some<T>;
    
    const getOrElse = <A, B>(o: OptionType<A>, orElse: B) => get('some', o)?.value ?? orElse;
    
    const num = Math.random();
    const maybeNumber: OptionType<number> = true ? Option.some(num) : Option.none();

    expect(getOrElse(maybeNumber, 100)).toBe(num);
    
    some.get(maybeNumber)?.value ?? 0;
  });

  it('symbol and number constructor keys', () => {
    const fooSymbol = Symbol('foo');
    const barSymbol = Symbol('bar');

    const FooBarBaz = discUnion({
      [fooSymbol]: (msg: string) => ({ msg }),
      [barSymbol]: (count: number) => ({ count }),
      baz: () => ({}),
    });
    type FBB = DiscUnionOf<typeof FooBarBaz>;

    const someFoo = FooBarBaz[fooSymbol]('hello');
    const someBar = FooBarBaz[barSymbol](45);
    const someBaz = FooBarBaz.baz();

    const unknownFoo = someFoo as FBB;
    const unknownBar = someBar as FBB;

    if (FooBarBaz[fooSymbol].is(unknownFoo)) {
      expect(unknownFoo.msg).toBe('hello')
    }

    if (FooBarBaz[barSymbol].is(unknownBar)) {
      expect(unknownBar.count).toBe(45)
    }

    const matchFBB = (fbb: FBB) => match(fbb, {
      [fooSymbol]: f => f.msg,
      [barSymbol]: b => b.count,
      baz: () => true
    });

    expect(matchFBB(unknownFoo)).toBe('hello');
    expect(matchFBB(unknownBar)).toBe(45);

    expect(is(fooSymbol, unknownFoo)).toBe(true);
    expect(is(barSymbol, unknownBar)).toBe(true);

    expect(get(fooSymbol, unknownFoo)).toBe(someFoo);
    expect(get(fooSymbol, unknownBar)).toBe(null);
    expect(get(barSymbol, unknownFoo)).toBe(null);
    expect(get(barSymbol, unknownBar)).toBe(someBar);

    expect(validate(barSymbol, unknownBar)).toBe(someBar);
    expect(validate(barSymbol, unknownBar)).toBe(someBar);
    expect(() => validate(barSymbol, unknownFoo)).toThrow();
    expect(() => validate(fooSymbol, unknownBar)).toThrow();

    const fooToBaz = (foo: Narrow<FBB, typeof fooSymbol>) => someBaz;
    const barToBaz = (bar: Narrow<FBB, typeof barSymbol>) => someBaz;

    expect(map(fooSymbol, unknownFoo, fooToBaz)).toBe(someBaz);
    expect(map(fooSymbol, unknownBar, fooToBaz)).toBe(someBar);

    expect(map(barSymbol, unknownFoo, barToBaz)).toBe(someFoo);
    expect(map(barSymbol, unknownBar, barToBaz)).toBe(someBaz);

    expect(FooBarBaz[fooSymbol].key).toEqual(fooSymbol);
    expect(FooBarBaz[barSymbol].key).toEqual(barSymbol);
  });
});