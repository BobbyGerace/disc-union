import { discUnion } from '../src';

describe('discUnion', () => {
  it('creates type constructors', () => {
    const FooBarBaz = discUnion({
      foo: (msg: string) => ({ msg }),
      bar: (count: number) => ({ count }),
      baz: () => ({}),
    });

    const someFoo = FooBarBaz.foo('hello');
    const someBar = FooBarBaz.bar(4);
    const someBaz = FooBarBaz.baz();

    expect(someFoo).toEqual({ type: 'foo', msg: 'hello' });
    expect(someBar).toEqual({ type: 'bar', count: 4 });
    expect(someBaz).toEqual({ type: 'baz' });
  });

  it('uses typeKey correctly', () => {
    const FooBarBaz = discUnion({
      baz: () => ({}),
    }, 'kind');

    const someBaz = FooBarBaz.baz();

    expect(someBaz.kind).toEqual('baz');
  });

  it('overwrites "type"', () => {
    const FooBarBaz = discUnion({
      foo: (value: number, type: boolean) => ({ value, type }),
    });

    const someFoo = FooBarBaz.foo(4, true);

    expect(someFoo.type).toEqual('foo');

    const FBBKind = discUnion({
      foo: (value: number, kind: boolean) => ({ value, kind }),
    }, 'kind');

    const someKindFoo = FBBKind.foo(4, true);

    expect(someKindFoo.kind).toEqual('foo');
  });
});