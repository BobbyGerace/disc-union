import { factory, DiscUnionOf } from '../src';

const {
  discUnion,
  match,
  is,
  map,
  maybeGet,
  validate,
  createType,
} = factory("noice");

const FooBarBaz = discUnion({
  foo: (msg: string) => ({ msg }),
  bar: (count: number) => ({ count }),
  baz: () => ({}),
});
type FBB = DiscUnionOf<typeof FooBarBaz>;

const someFoo = FooBarBaz.foo('hello');
const someBar = FooBarBaz.bar(4);
const someBaz = FooBarBaz.baz();

const unknownFoo = someFoo as FBB;

describe('factory', () => {
  it('creates "discUnion" with different default typeKey', () => {
    expect(someFoo).toEqual({ noice: 'foo', msg: 'hello' });
    expect(someBar).toEqual({ noice: 'bar', count: 4 });
    expect(someBaz).toEqual({ noice: 'baz' });
  });

  it('creates "is" with different default typeKey', () => {
    expect(is('foo', unknownFoo)).toBe(true);
  });

  it('creates "createType" with different default typeKey', () => {
    expect(createType('ayyy', { lmao: 4 })).toEqual({ noice: 'ayyy', lmao: 4});
  });

  it('creates "map" with different default typeKey', () => {
    expect(map('foo', unknownFoo, (foo) => foo.msg)).toBe(someFoo.msg);
  });

  it('creates "map" with different default typeKey', () => {
    expect(match(unknownFoo, {
      foo: foo => foo.msg,
      bar: bar => bar.count,
      baz: baz => baz.noice
    })).toBe(someFoo.msg);
  });

  it('creates "maybeGet" with different default typeKey', () => {
    expect(maybeGet('foo', unknownFoo)).toBe(someFoo);
  });

  it('creates "validate" with different default typeKey', () => {
    expect(validate('foo', unknownFoo)).toBe(someFoo);
  });
});