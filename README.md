# disc-union
A set utilities for working with discriminated unions in typescript

## Introduction
Discriminated unions are a powerful and expressive way of modelling data in Typescript, but working with them often requires a lot of boilerplate code. This library is a collection of utilities for creating and handling discriminated union types in a way that is more elegant and concise. 

We aim to be generic by leveraging Typescripts type inference to determine the types. So these functions work well with any discriminated union, no matter how they are constructed.

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
 * ApiResult = 
 *  | { type: 'success', post: Posts[] } 
 *  | { type: 'error', message: string }
 *  | { type: 'loading' }
 */
type ApiResult = DiscUnionOf<typeof ApiResult>;

// discUnion returns constructor functions for each type
const fetchPosts = () =>
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then((response) => response.json() as Promise<Post[]>)
    .then(posts => ApiResult.success(posts))
    .catch(() => ApiResult.error('Something went wrong'));

function Posts() {
  const [apiState, setApiState] = useState<ApiResult>(ApiResult.loading());

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
### `discUnion` 
`discUnion :: (constructors: Constructors, typeKey?: string, prefix?: string)`

`discUnion` takes an object whose values are constructor functions for your types, and whose keys are the names of the corresponding types. It wraps the results of the functions to include the type names automatically. For example:

```ts
  const Dinosaur = discUnion({
    tRex: (name: string) => ({ name }),
    pterodactyl: (wingspan: number) => ({ wingspan }),
    stegosaurus: (numPlates: number) => ({ numPlates })
  });

  Dinosaur.pterodactyl(16) // { type: 'pterodactyl', wingspan: 16 }
```

`discUnion` also optionally takes a `typeKey` argument, which allows you to change the key of the discriminant (as does every other function in this library). And you can prefix the type names if you'd like by providing a string as `prefix`

```ts
  const Dinosaur = discUnion({
    tRex: (name: string) => ({ name }),
    pterodactyl: (wingspan: number) => ({ wingspan }),
    stegosaurus: (numPlates: number) => ({ numPlates })
  }, 'species', '@dinosaur/');

  Dinosaur.pterodactyl(16); // { species: '@dinosaur/pterodactyl', wingspan: 16 }

  // The type constructors have a `key` property attached to easily access these values.
  // This comes in handy with prefixed keys or keys with special characters.
  match(dino, {
    [Dinosaur.tRex.key]: t => p.name.length,
    [Dinosaur.pterodactyl.key]: p => p.wingspan
    [Dinosaur.stegosaurus.key]: s => p.numPlates
  }, 'species');
```

### `match` 
`match :: (handlers: Handlers, typeKey?: string)`
`match :: (handlers: Partial<Handlers>, otherwise: Handler, typeKey?: string)`

`match` takes an object of handlers whose keys correspond to the possible keys of the input type, and it returns the result of the matched handler. It is exhaustive by default, but if you include an `otherwise` handler as the second argument then handlers may be partial.

```ts
  // Full match
  const describeDino = (dino: Dinosaur) => match(dino, {
    tRex: tRex => `A T-Rex named ${tRex.name}`,
    pterodactyl: pt => `A pterodactyl with a ${pt.wingspan} foot wingspan`,
    stegosaurus: steg => `A stegosaurus with ${steg.numPlates} plates along its back`,
  });

  describeDino(Dinosaur.tRex('Bill')) // A T-Rex named Bill
```

```ts
  // Partial match
  const describeDino = (dino: Dinosaur) => match(dino, {
    tRex: tRex => `A T-Rex named ${tRex.name}`,
  }, () => 'Some other dinosaur');

  describeDino(Dinosaur.stegosaurus(7)) // Some other dinosaur
```

### `is` 
`is :: (type: string, obj: DiscriminatedUnionType)`

`is` is a convenience function for narrowing the type of an discriminated union type. It is equivalent to `obj.type === 'something'`.

```ts
  if (is('tRex', unknownDino)) {
    console.log('hello', unknownDino.name);
  }
```
