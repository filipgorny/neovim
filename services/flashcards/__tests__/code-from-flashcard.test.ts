import { codeFromFlashcard } from '../code-from-flashcard'

describe('code-from-flashcard', () => {
  it('creates a flashcard code from given string', () => {
    const input = 42
    const expected = '00042'

    const result = codeFromFlashcard(input)

    expect(result).toEqual(expected)
  })

  it('returns input if undefined given', () => {
    const input = undefined
    const expected = undefined

    const result = codeFromFlashcard(input)

    expect(result).toEqual(expected)
  })

  it('returns input if string already has 5 characters', () => {
    const input = '12345'
    const expected = '12345'

    const result = codeFromFlashcard(input)

    expect(result).toEqual(expected)
  })
})
