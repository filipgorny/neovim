import { takeExcerpt } from '../take-excerpt'

const text = `Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, 
there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, 
a large language ocean. A small river named Duden flows by their place and supplies it with the necessary 
regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. 
One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far 
World of Grammar.
`

describe('take-excerpt', () => {
  it('extracts a word with surrounding text, on default settings', () => {
    const expected = '(...)behind the word mountains, far from the(...)'
    const result = takeExcerpt('mount')(text)

    expect(result).toEqual(expected)
  })

  it('extracts a word with surrounding text, custom settings', () => {
    const expected = '---A small river named Duden---'
    const result = takeExcerpt('RiVER', 3, '---')(text)

    expect(result).toEqual(expected)
  })

  it('does nothing on nil data', () => {
    const expected = undefined
    const result = takeExcerpt('RiVER', 3, '---')(undefined)

    expect(result).toEqual(expected)
  })

  it('does nothing on empty string', () => {
    const expected = ''
    const result = takeExcerpt('RiVER', 3, '---')('')

    expect(result).toEqual(expected)
  })

  it('extracts a word with surrounding text, no left ellipsis if not needed', () => {
    const expected = 'Far far away, behind the word mountains,(...)'
    const result = takeExcerpt('behind')(text)

    expect(result).toEqual(expected)
  })

  it('extracts a word with surrounding text, no right ellipsis if not needed', () => {
    const expected = '(...)for the far World of Grammar.'
    const result = takeExcerpt('WORLD')(text)

    expect(result).toEqual(expected)
  })
})
