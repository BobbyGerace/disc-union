import { DiscUnionOf, discUnion, maybeGet } from '../src';

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

const someFooK = FooBarBazK.foo('hello');
const someBarK = FooBarBazK.bar(4);

describe('maybeGet', () => {
  it('gets type correctly', () => {
    expect(maybeGet('foo', someFoo as FBB)).toBe(someFoo);
    expect(maybeGet('foo', someBar as FBB)).toBe(null);
    expect(maybeGet('bar', someFoo as FBB)).toBe(null);
    expect(maybeGet('bar', someBar as FBB)).toBe(someBar);
  });

  it('works with typeKey', () => {
    expect(maybeGet('foo', someFooK as FBBK, 'kind')).toBe(someFooK);
    expect(maybeGet('foo', someBarK as FBBK, 'kind')).toBe(null);
    expect(maybeGet('bar', someFooK as FBBK, 'kind')).toBe(null);
    expect(maybeGet('bar', someBarK as FBBK, 'kind')).toBe(someBarK);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    expect(maybeGet('foo', unknownFbb)?.msg).toBe('hello')
  });
});