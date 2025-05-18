import { wrapProps } from '../wrap-props'

describe('wrap-props', () => {
  it('wraps selected props under a new prop', () => {
    const input = {
      foo: 15,
      bar: 14,
      baz: 16
    }

    const expected = {
      bar: 14,
      props: {
        foo: 15,
        baz: 16
      }
    }

    expect(wrapProps('props', ['foo', 'baz'])(input)).toEqual(expected)
  })
})
