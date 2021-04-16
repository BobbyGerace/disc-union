import { DiscUnionOf, is, discUnion } from '../src';

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

describe('is', () => {
  it('identifies types correctly', () => {
    expect(is('foo', someFoo as FBB)).toBe(true);
    expect(is('foo', someBar as FBB)).toBe(false);
    expect(is('bar', someFoo as FBB)).toBe(false);
    expect(is('bar', someBar as FBB)).toBe(true);
  });

  it('works with typeKey', () => {
    expect(is('foo', someFooK as FBBK, 'kind')).toBe(true);
    expect(is('foo', someBarK as FBBK, 'kind')).toBe(false);
    expect(is('bar', someFooK as FBBK, 'kind')).toBe(false);
    expect(is('bar', someBarK as FBBK, 'kind')).toBe(true);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    if (is('foo', unknownFbb)) {
      expect(unknownFbb.msg).toBe('hello')
    }
  });
});