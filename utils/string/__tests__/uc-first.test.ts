import ucFirst from '../uc-first'

describe('uc-first', () => {
  it('change first letter to uppercase', () => {
    const input = 'foo bar'
    const expected = 'Foo bar'

    const result = ucFirst(input)

    expect(result).toEqual(expected)
  })

  it('when first letter is already uppercase', () => {
    const input = 'FOO bar'
    const expected = 'FOO bar'

    const result = ucFirst(input)

    expect(result).toEqual(expected)
  })
})
