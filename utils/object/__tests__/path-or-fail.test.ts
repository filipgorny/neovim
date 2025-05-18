import { pathOrFail } from '../path-or-fail'

const input = {
  foo: {
    bar: {
      baz: 42,
    },
  },
}

describe('path-or-fail', () => {
  it('returns value under path if it exists', () => {
    const result = pathOrFail(['foo', 'bar', 'baz'], new Error())(input)

    expect(result).toEqual(42)
  })

  it('throws exception of value under path is nil', () => {
    expect(() => pathOrFail(['foo', 'bar', 'qwe'], new Error(), input)).toThrow()
  })
})
