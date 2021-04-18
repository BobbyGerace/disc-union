# disc-union
A set utilities for working with discriminated unions in typescript

## Introduction
Discriminated unions are a powerful and expressive way of modelling data in Typescript, but working with them often requires a lot of boilerplate code. This library is a collection of utilities for creating and handling discriminated union types in a way that is more elegant and concise. 

We aim to be generic by leveraging Typescripts type inference to determine the types. So these functions work well with any discriminated union, no matter how they are constructed.

Note: This library uses Typescript's template literal types, and so requires Typescript version >= 4.1

## Motivating Example
### State of an API call in React
```tsx
// Model the data by providing constructor functions for each type
const ApiResult = discUnion({
  success: (posts: Post[]) => ({ posts }),
  error: (message: string) => ({ message }),
  loading: () => ({}),
});

/**
 * use DiscUnionOf to extract the type of the discriminated union
 * ApiResultType = 
 *  | { type: 'success', post: Posts[] } 
 *  | { type: 'error', message: string }
 *  | { type: 'loading' }
 */
type ApiResultType = DiscUnionOf<typeof ApiResult>;

// discUnion returns constructor functions for each type
const fetchPosts = () =>
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then((response) => response.json() as Promise<Post[]>)
    .then(posts => ApiResult.success(posts))
    .catch(() => ApiResult.error('Something went wrong'));

function Posts() {
  const [apiState, setApiState] = useState<ApiResultType>(ApiResult.loading());

  useEffect(() => {
    fetchPosts().then(setApiState)
  }, [])

  // Use the match function to exhaustively match each type
  return match(apiState, {
    success: ({ posts }) => <div>
      {posts.map(p => <div key={p.id}>{p.body}</div>)}
    </div>,
    error: ({ message }) => <span>Error: {message}</span>,
    loading: () => <div>loading...</div>
  });
}
```

## Functions
### discUnion
`(constructors: Constructors, typeKey?: string, prefix?: string) => ConstructorsWithType`

`discUnion` takes an object whose values are constructor functions for your types, and whose keys are the names of the corresponding types. It wraps the results of the functions to include the type names automatically. For example:

```ts
const Dinosaur = discUnion({
  tRex: (armSize: 'normal' | 'smol') => ({ armSize }),
  pterodactyl: (wingspan: number) => ({ wingspan }),
  stegosaurus: (numPlates: number) => ({ numPlates })
});

Dinosaur.pterodactyl(16) // { type: 'pterodactyl', wingspan: 16 }
```

`discUnion` also optionally takes a `typeKey` argument, which allows you to change the key of the discriminant (as does every other function in this library). And you can prefix the type names if you'd like by providing a string as `prefix`

```ts
const Dinosaur = discUnion({
  tRex: (armSize: 'normal' | 'smol') => ({ armSize }),
  pterodactyl: (wingspan: number) => ({ wingspan }),
  stegosaurus: (numPlates: number) => ({ numPlates })
}, 'species', '@dinosaur/');

Dinosaur.pterodactyl(16); // { species: '@dinosaur/pterodactyl', wingspan: 16 }

// The type constructors have a `key` property attached to easily access these values.
// This comes in handy with prefixed keys or keys with special characters.
match(dino, {
  [Dinosaur.tRex.key]: t => p.armSize.length,
  [Dinosaur.pterodactyl.key]: p => p.wingspan
  [Dinosaur.stegosaurus.key]: s => p.numPlates
}, 'species');
```

### match
`(handlers: Handlers, typeKey?: string) => Return of matched handler`

`(handlers: Partial<Handlers>, otherwise: Handler, typeKey?: string) => Return of matched handler`

`match` takes an object of handlers whose keys correspond to the possible keys of the input type, and it returns the result of the matched handler. It is exhaustive by default, but if you include an `otherwise` handler as the second argument then handlers may be partial.

```ts
// Full match
const describeDino = (dino: Dinosaur) => match(dino, {
  tRex: tRex => `A T-Rex with ${tRex.armSize} arms`,
  pterodactyl: pt => `A pterodactyl with a ${pt.wingspan} foot wingspan`,
  stegosaurus: steg => `A stegosaurus with ${steg.numPlates} plates along its back`,
});

describeDino(Dinosaur.tRex('smol')) // A T-Rex with smol arms
```

```ts
// Partial match
const describeDino = (dino: Dinosaur) => match(dino, {
  tRex: tRex => `A T-Rex with ${tRex.armSize} arms`,
}, () => 'Some other dinosaur');

describeDino(Dinosaur.stegosaurus(7)) // Some other dinosaur
```

### is
`(type: string, obj: DiscUnionType, typeKey?: string) => obj is Narrowed<DiscUnionType, type>`

`is` is a convenience function for narrowing the type of a discriminated union type. It is equivalent to `obj.type === 'something'`.

```ts
if (is('tRex', unknownDino)) {
  console.log(unknownDino.armSize);
}
```

### get
`(type: string, obj: DiscUnionType, typeKey?: string) => Narrowed<DiscUnionType, type> | null`

`get` returns the object if it matches the type, and null otherwise

```ts
const wingspan = get('pterodactyl' unknownDino)?.wingspan ?? 0;
```

### validate
`(type: string, obj: DiscUnionType, typeKey?: string) => Narrowed<DiscUnionType, type>`

`validate` returns the object if it matches the type, and throws an error otherwise. For when you are 100% sure about the type and it would be a fatal error otherwise.

```ts
const wingspan = validate('pterodactyl' unknownDino).wingspan;
```

### createType
`(type: string, obj: object, typeKey?: string) => WithType<typeof obj, type, typeKey>`

`createType` is a convenience function for constructing objects with types. It can helpful if you are creating your constructors manually instead of using discUnion (which is necessary for generics - see below).

```ts
const apiResult = <T>(data: T) => createType('apiResult', { data })>;

const result = apiResult({ userId: 4, userName: 'LeeroyJenkins' });
```

### factory
`(factoryTypeKey: string) => LibraryFunctions`

By default, all functions in this library assume the discriminant property to be `type`. Although this can be overridden with the `typeKey` property, you can also use `factory` to create a new set of functions that use whichever default you'd like. For example, if your convention is to use the `kind` property:


```ts
const { 
  discUnion, 
  match,
  is, 
  // ...
} = factory('kind');

const someDuck = { kind: 'duck', greeting: 'quack' };

is('duck', someDuck); // true
```

## Utility Types

### DiscUnionOf

`DiscUnionOf<T>`

Takes an object of constructors, and returns a discriminated union based on their return type. Used on the return of `discUnion`

### Narrow

`Narrow<T, Key, TypeKey?>`

Takes a discriminated union type, and narrows it based on a key.

### Without

`Without<T, Key, TypeKey?>`

Opposite of `Narrow`. Takes a discriminated union type, and excludes the types with matching keys.

### Keys

`Keys<T, TypeKey?>`

Takes a discriminated union type, and returns a list of all possible keys as a union of strings
## Generics

Unfortunately, due to limitations of Typescript's type inference, there is no way create a generic discriminated union with `discUnion`. You can stil use the library to work with these types, but you'll have to write some of the boilerplate yourself to make it work. As an example, here is how you can create an `Option` type that can hold any value (or not):

```ts
// Leave out any types with generic parameters
const _Option = discUnion({
  none: () => ({}),
});

// Write the generic type and constructor yourself (you can still use createType)
export type Some<T> = { type: 'some', value: T };
const some = <T>(value: T) => createType('some', { value });

// Wrap DiscUnionOf with your own generic type
export type OptionType<T> = DiscUnionOf<typeof _Option> | Some<T>;

// Spread the new constructor into the object
export const Option = {
  ..._Option,
  some,
};

// Correctly infers maybeNum: OptionType<number>
const maybeNum = Math.random() > 0.5 ? Option.some(4) : Option.none(); 
```

This exported Option object works just like one that would come from `discUnion`, except it is generic. The only thing missing is the `key` property attached to the constructor, if you would like to add that, you can wrap your function in an `Object.assign` like so:

```ts
const some = Object.assign(
  <T>(value: T) => createType('some', { value }),
  { key: 'some' as 'some' } 
);
```

