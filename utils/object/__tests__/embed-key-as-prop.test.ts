import { embedKeyAsProp } from '../embed-key-as-prop'

describe('embed-key-as-prop', () => {
  it('embeds object key as a prop', () => {
    const input = {
      foo: {
        name: 'john',
      },
      bar: {
        name: 'tom',
      },
    }

    const expected = [
      {
        name: 'john',
        some_key: 'foo',
      },
      {
        name: 'tom',
        some_key: 'bar',
      },
    ]

    const result = embedKeyAsProp('some_key')(input)

    expect(result).toEqual(expected)
  })
})
