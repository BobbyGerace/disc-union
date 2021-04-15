import { createType } from '../src';

describe('createType', () => {
  it('Creates a type from an object', () => {
    expect(createType('foobar', { foo: 'bar', baz: 4, bang: true }))
      .toEqual({  type: 'foobar', foo: 'bar', baz: 4, bang: true })
  });

  it('works with typeKey', () => {
    expect(createType('foobar', { foo: 'bar', baz: 4, bang: true }, 'kind'))
      .toEqual({ kind: 'foobar', foo: 'bar', baz: 4, bang: true })
  });

  it('overwrites "type" property', () => {
    expect(createType('foobar', { foo: 'bar', type: 4, kind: true }))
      .toEqual({ type: 'foobar', foo: 'bar', kind: true })

    expect(createType('foobar', { foo: 'bar', type: 4, kind: true }, 'kind'))
      .toEqual({ kind: 'foobar', foo: 'bar', type: 4 })
  });
});