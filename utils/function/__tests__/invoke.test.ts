import { invoke } from '../invoke'

describe('invoke', () => {
  it('invoke a function without additional params', () => {
    const input = '  abcdefghijklm '
    const expected = 'abcdefghijklm'

    const result = invoke('trim')(input)

    expect(result).toEqual(expected)
  })

  it('invoke a function with params', () => {
    const input = 'abcdefghijklm'
    const expected = 'ghijklm'

    const result = invoke('slice', 1, 6)(input)

    expect(result).toEqual(expected)
  })
})
