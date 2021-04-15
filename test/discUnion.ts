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
})