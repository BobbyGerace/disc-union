import { DiscUnionOf, discUnion, validate } from '../src';

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

describe('validate', () => {
  it('validates type correctly', () => {
    expect(validate('foo', someFoo as FBB)).toBe(someFoo);
    expect(() => validate('foo', someBar as FBB)).toThrow();
    expect(() => validate('bar', someFoo as FBB)).toThrow();
    expect(validate('bar', someBar as FBB)).toBe(someBar);
  });

  it('works with typeKey', () => {
    expect(validate('foo', someFooK as FBBK, 'kind')).toBe(someFooK);
    expect(() => validate('foo', someBarK as FBBK, 'kind')).toThrow();
    expect(() => validate('bar', someFooK as FBBK, 'kind')).toThrow();
    expect(validate('bar', someBarK as FBBK, 'kind')).toBe(someBarK);
  });

  it('narrows type correctly', () => {
    const unknownFbb = someFoo as FBB;
    expect(validate('foo', unknownFbb).msg).toBe('hello')
  });
});