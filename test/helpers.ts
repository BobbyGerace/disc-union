import { DiscUnionOf, discUnion, Narrow } from '../src';

const FooBarBaz = discUnion({
  foo: (msg: string) => ({ msg }),
  bar: (count: number) => ({ count }),
  baz: () => ({}),
});
type FBB = DiscUnionOf<typeof FooBarBaz>;

const { foo, bar, baz } = FooBarBaz;

const someFoo = FooBarBaz.foo('hello') as FBB;
const someBar = FooBarBaz.bar(4) as FBB;
const someBaz = FooBarBaz.bar(4) as FBB;

const unkownFoo = someFoo as FBB;
const unknownBar = someBar as FBB;

describe('get', () => {
  it('get works correctly', () => {
    expect(foo.get(unkownFoo)).toBe(someFoo);
    expect(foo.get(unknownBar)).toBe(null);
    expect(bar.get(unkownFoo)).toBe(null);
    expect(bar.get(unknownBar)).toBe(someBar);
  });

  it('is narrows type correctly', () => {
    if (foo.is(unkownFoo)) {
      expect(unkownFoo.msg).toBe('hello')
    }
  });

  it('maps correctly', () => {
    const unknownFoo = someFoo as FBB;
    const unknownBar = someBar as FBB;
    const fooToBaz = (foo: Narrow<FBB, 'foo'>) => someBaz;
    const barToBaz = (bar: Narrow<FBB, 'bar'>) => someBaz;

    expect(foo.map(unknownFoo, fooToBaz)).toBe(someBaz);
    expect(foo.map(unknownBar, fooToBaz)).toBe(someBar);

    expect(bar.map(unknownFoo, barToBaz)).toBe(someFoo);
    expect(bar.map(unknownBar, barToBaz)).toBe(someBaz);
  });

  it('validates correctly', () => {
    expect(foo.validate(someFoo as FBB)).toBe(someFoo);
    expect(() => foo.validate(someBar as FBB)).toThrow();
    expect(() => bar.validate(someFoo as FBB)).toThrow();
    expect(bar.validate(someBar as FBB)).toBe(someBar);
  });

  it('uses correct typekey/prefix', () => {
    const FooBarBaz = discUnion({
      foo: (msg: string) => ({ msg }),
      bar: (count: number) => ({ count }),
      baz: () => ({}),
    }, 'kind', '@test/');
    type FBB = DiscUnionOf<typeof FooBarBaz>;

    const { foo } = FooBarBaz;

    const someFoo = FooBarBaz.foo('hello') as FBB;

    const unkownFoo = someFoo as FBB;

    if (foo.is(unkownFoo)) {
      expect(unkownFoo.msg).toBe('hello')
    }
  });
});