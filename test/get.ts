import { DiscUnionOf, discUnion, get } from '../src';

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

describe('get', () => {
  it('gets type correctly', () => {
    expect(get('foo', someFoo as FBB)).toBe(someFoo);
    expect(get('foo', someBar as FBB)).toBe(null);
    expect(get('bar', someFoo as FBB)).toBe(null);
    expect(get('bar', someBar as FBB)).toBe(someBar);
  });

  it('works with typeKey', () => {
    expect(get('foo', someFooK as FBBK, 'kind')).toBe(someFooK);
    expect(get('foo', someBarK as FBBK, 'kind')).toBe(null);
    expect(get('bar', someFooK as FBBK, 'kind')).toBe(null);
    expect(get('bar', someBarK as FBBK, 'kind')).toBe(someBarK);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    expect(get('foo', unknownFbb)?.msg).toBe('hello')
  });
});