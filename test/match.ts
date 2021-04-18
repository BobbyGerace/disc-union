import { DiscUnionOf, match, discUnion } from '../src';

const FooBarBaz = discUnion({
  foo: (msg: string) => ({ msg }),
  bar: (count: number) => ({ count }),
  baz: () => ({}),
});
type FBB = DiscUnionOf<typeof FooBarBaz>;

const someFoo = FooBarBaz.foo('hello');
const someBar = FooBarBaz.bar(4);
const someBaz = FooBarBaz.baz();


describe('match', () => {
  it('matches types correctly', () => {
    const matchFBB = (fbb: FBB) => match(fbb, {
      foo: foo => foo.msg,
      bar: bar => bar.count,
      baz: () => true
    });

    expect(matchFBB(someFoo)).toBe('hello');
    expect(matchFBB(someBar)).toBe(4);
    expect(matchFBB(someBaz)).toBe(true);
  });
  
  it('handles partial match correctly', () => {
    const matchFBB = (fbb: FBB) => match(fbb, {
      foo: foo => foo.msg,
    }, fbb => fbb.type);

    expect(matchFBB(someFoo)).toBe('hello');
    expect(matchFBB(someBar)).toBe('bar');
    expect(matchFBB(someBaz)).toBe('baz');
  });
  
  it('works with string keys', () => {
    const Dinosaur = discUnion({
      '@dinosaur/t-rex': (armSize: 'normal' | 'smol') => ({ armSize }),
      '@dinosaur/pterodactyl': (wingspan: number) => ({ wingspan }),
      '@dinosaur/stegosaurus': (numPlates: number) => ({ numPlates })
    });
    type Dinosaur = DiscUnionOf<typeof Dinosaur>;

    const someTRex = Dinosaur['@dinosaur/t-rex']('smol');
    const somePterodactyl = Dinosaur['@dinosaur/pterodactyl'](16);
    const someStegosaurus = Dinosaur['@dinosaur/stegosaurus'](7);

    const describeDino = (dino: Dinosaur) => match(dino, {
      '@dinosaur/t-rex': tRex => `A T-Rex with ${tRex.armSize} arms`,
      '@dinosaur/pterodactyl': pt => `A pterodactyl with a ${pt.wingspan} foot wingspan`,
      '@dinosaur/stegosaurus': steg => `A stegosaurus with ${steg.numPlates} plates along its back`,
    });

    expect(describeDino(someTRex)).toBe('A T-Rex with smol arms');
    expect(describeDino(somePterodactyl)).toBe('A pterodactyl with a 16 foot wingspan');
    expect(describeDino(someStegosaurus)).toBe('A stegosaurus with 7 plates along its back');
  });
  
  it('handles kind correctly', () => {
    const FooBarBazK = discUnion({
      foo: (msg: string) => ({ msg }),
      bar: (count: number) => ({ count }),
      baz: () => ({}),
    }, 'kind');
    type FBBK = DiscUnionOf<typeof FooBarBazK>;

    const someFooK = FooBarBazK.foo('hello');
    const someBarK = FooBarBazK.bar(4);
    const someBazK = FooBarBazK.baz();

    const matchFBB = (fbb: FBBK) => match(fbb, {
      foo: foo => foo.msg,
    }, fbb => fbb.kind, 'kind');

    const matchFBB2 = (fbb: FBBK) => match(fbb, {
      foo: foo => foo.msg,
      bar: bar => bar.count,
      baz: () => 'ayy'
    }, 'kind');

    expect(matchFBB(someFooK)).toBe('hello');
    expect(matchFBB(someBarK)).toBe('bar');
    expect(matchFBB(someBazK)).toBe('baz');

    expect(matchFBB2(someFooK)).toBe('hello');
    expect(matchFBB2(someBarK)).toBe(4);
    expect(matchFBB2(someBazK)).toBe('ayy');
  });
});