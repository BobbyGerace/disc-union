import { DiscUnionOf, discUnion, maybeGetType } from '../src';

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

describe('maybeGetType', () => {
  it('gets type correctly', () => {
    expect(maybeGetType('foo', someFoo as FBB)).toBe(someFoo);
    expect(maybeGetType('foo', someBar as FBB)).toBe(null);
    expect(maybeGetType('bar', someFoo as FBB)).toBe(null);
    expect(maybeGetType('bar', someBar as FBB)).toBe(someBar);
  });

  it('works with typeKey', () => {
    expect(maybeGetType('foo', someFooK as FBBK, 'kind')).toBe(someFooK);
    expect(maybeGetType('foo', someBarK as FBBK, 'kind')).toBe(null);
    expect(maybeGetType('bar', someFooK as FBBK, 'kind')).toBe(null);
    expect(maybeGetType('bar', someBarK as FBBK, 'kind')).toBe(someBarK);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    expect(maybeGetType('foo', unknownFbb)?.msg).toBe('hello')
  });
});