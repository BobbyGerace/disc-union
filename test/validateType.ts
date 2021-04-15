import { DiscUnionOf, discUnion, validateType } from '../src';

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

describe('validateType', () => {
  it('validates type correctly', () => {
    expect(validateType('foo', someFoo as FBB)).toBe(someFoo);
    expect(() => validateType('foo', someBar as FBB)).toThrow();
    expect(() => validateType('bar', someFoo as FBB)).toThrow();
    expect(validateType('bar', someBar as FBB)).toBe(someBar);
  });

  it('works with typeKey', () => {
    expect(validateType('foo', someFooK as FBBK, 'kind')).toBe(someFooK);
    expect(() => validateType('foo', someBarK as FBBK, 'kind')).toThrow();
    expect(() => validateType('bar', someFooK as FBBK, 'kind')).toThrow();
    expect(validateType('bar', someBarK as FBBK, 'kind')).toBe(someBarK);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    expect(validateType('foo', unknownFbb).msg).toBe('hello')
  });
});