import { DiscUnionOf, isType, discUnion } from '../src';

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

describe('isType', () => {
  it('identifies types correctly', () => {
    expect(isType('foo', someFoo as FBB)).toBe(true);
    expect(isType('foo', someBar as FBB)).toBe(false);
    expect(isType('bar', someFoo as FBB)).toBe(false);
    expect(isType('bar', someBar as FBB)).toBe(true);
  });

  it('works with typeKey', () => {
    expect(isType('foo', someFooK as FBBK, 'kind')).toBe(true);
    expect(isType('foo', someBarK as FBBK, 'kind')).toBe(false);
    expect(isType('bar', someFooK as FBBK, 'kind')).toBe(false);
    expect(isType('bar', someBarK as FBBK, 'kind')).toBe(true);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    if (isType('foo', unknownFbb)) {
      expect(unknownFbb.msg).toBe('hello')
    }
  });
});