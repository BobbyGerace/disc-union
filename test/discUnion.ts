import { discUnion, DiscUnionOf, is, match } from '../src';

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

    expect(someBaz.kind).toBe('baz');
  });

  it('overwrites "type"', () => {
    const FooBarBaz = discUnion({
      foo: (value: number, type: boolean) => ({ value, type }),
    });

    const someFoo = FooBarBaz.foo(4, true);

    expect(someFoo.type).toBe('foo');

    const FBBKind = discUnion({
      foo: (value: number, kind: boolean) => ({ value, kind }),
    }, 'kind');

    const someKindFoo = FBBKind.foo(4, true);

    expect(someKindFoo.kind).toBe('foo');
  });

  it('handles prefix', () => {
    const Dinosaur = discUnion({
      tRex: (name: string) => ({ name }),
      pterodactyl: (wingspan: number) => ({ wingspan }),
      stegosaurus: (numPlates: number) => ({ numPlates })
    }, 'type', '@dinosaur/');
    type Dinosaur = DiscUnionOf<typeof Dinosaur>;

    const { tRex, pterodactyl, stegosaurus } = Dinosaur;

    const someTRex = Dinosaur.tRex('Bill');
    const somePterodactyl = Dinosaur.pterodactyl(16);
    const someStegosaurus = Dinosaur.stegosaurus(7);

    expect(someTRex).toEqual({ type: '@dinosaur/tRex', name: 'Bill' });
    expect(somePterodactyl).toEqual({ type: '@dinosaur/pterodactyl', wingspan: 16 });
    expect(someStegosaurus).toEqual({ type: '@dinosaur/stegosaurus', numPlates: 7 });

    expect(tRex.key).toBe('@dinosaur/tRex');
    expect(pterodactyl.key).toBe('@dinosaur/pterodactyl');
    expect(stegosaurus.key).toBe('@dinosaur/stegosaurus');
    
    // Below is just to make sure type checking works

    const unknownTRex = someTRex as Dinosaur;

    if (unknownTRex.type === Dinosaur.tRex.key) {
      unknownTRex.name;
    }

    if (is(pterodactyl.key, unknownTRex)) {
      unknownTRex.wingspan;
    }

    match(unknownTRex, {
      [tRex.key]: () => null,
      [pterodactyl.key]: () => null,
      [stegosaurus.key]: () => null,
    })
  });

  it('helpers', () => {
    const Dinosaur = discUnion({
      tRex: (name: string) => ({ name }),
      pterodactyl: (wingspan: number) => ({ wingspan }),
      stegosaurus: (numPlates: number) => ({ numPlates })
    });
    type Dinosaur = DiscUnionOf<typeof Dinosaur>;

    const { tRex, pterodactyl, stegosaurus } = Dinosaur;

    const someTRex = Dinosaur.tRex('Bill');
    const somePterodactyl = Dinosaur.pterodactyl(16);
    const someStegosaurus = Dinosaur.stegosaurus(7);

    // Below is just to make sure type checking works

    const unknownTRex = someTRex as Dinosaur;

    if (tRex.is(unknownTRex)) {
      unknownTRex.name;
    }

    if (pterodactyl.is(unknownTRex)) {
      unknownTRex.wingspan;
    }

    match(unknownTRex, {
      [tRex.key]: () => null,
      [pterodactyl.key]: () => null,
      [stegosaurus.key]: () => null,
    })
  });
});