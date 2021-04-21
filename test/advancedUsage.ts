import { DiscUnionOf, discUnion, createType, get, attachExtras } from '../src';

describe('advanced usage', () => {
  it('generic types work', () => {
    const _Option = discUnion({
      none: () => ({}),
    });
    
    type Some<T> = { type: 'some', value: T };
    const some = attachExtras(
      <T>(value: T) => createType('some', { value }),
      'some'
    );
    
    const Option = {
      ..._Option,
      some,
    };
    
    type OptionType<T> = DiscUnionOf<typeof _Option> | Some<T>;
    
    const getOrElse = <A, B>(o: OptionType<A>, orElse: B) => get('some', o)?.value ?? orElse;
    
    const num = Math.random();
    const maybeNumber: OptionType<number> = true ? Option.some(num) : Option.none();

    expect(getOrElse(maybeNumber, 100)).toBe(num);
    
    some.get(maybeNumber)?.value ?? 0;
  });
});