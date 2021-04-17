import { DiscUnionOf, discUnion, map, Narrow } from '../src';

const FooBarBaz = discUnion({
  foo: (msg: string) => ({ msg }),
  bar: (count: number) => ({ count }),
  baz: () => ({}),
});
type FBB = DiscUnionOf<typeof FooBarBaz>;

const FooBarBazK = discUnion({
  foo: (msg: string) => ({ msg }),
  bar: (count: number) => ({ count }),
  baz: () => ({}),
}, 'kind');
type FBBK = DiscUnionOf<typeof FooBarBazK>;

const someFoo = FooBarBaz.foo('hello');
const someBar = FooBarBaz.bar(4);
const someBaz = FooBarBaz.baz();

const someFooK = FooBarBazK.foo('hello');
const someBarK = FooBarBazK.bar(4);
const someBazK = FooBarBaz.baz();

describe('map', () => {

  it('maps to something else if type', () => {
    const unknownFoo = someFoo as FBB;
    const unknownBar = someBar as FBB;
    const fooToBaz = (foo: Narrow<FBB, 'foo'>) => someBaz;
    const barToBaz = (bar: Narrow<FBB, 'bar'>) => someBaz;

    expect(map('foo', unknownFoo, fooToBaz)).toBe(someBaz);
    expect(map('foo', unknownBar, fooToBaz)).toBe(someBar);

    expect(map('bar', unknownFoo, barToBaz)).toBe(someFoo);
    expect(map('bar', unknownBar, barToBaz)).toBe(someBaz);
  });

  it('works with typeKey', () => {
    const unknownFooK = someFooK as FBBK;
    const unknownBarK = someBarK as FBBK;
    const fooToBaz = (foo: Narrow<FBBK, 'foo', 'kind'>) => someBazK;
    const barToBaz = (bar: Narrow<FBBK, 'bar', 'kind'>) => someBazK;

    expect(map('foo', unknownFooK, fooToBaz, 'kind')).toBe(someBazK);
    expect(map('foo', unknownBarK, fooToBaz, 'kind')).toBe(someBarK);

    expect(map('bar', unknownFooK, barToBaz, 'kind')).toBe(someFooK);
    expect(map('bar', unknownBarK, barToBaz, 'kind')).toBe(someBazK);
  });
});