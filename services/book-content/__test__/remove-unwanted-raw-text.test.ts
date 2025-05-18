import removeUnwantedRawText from '../remove-unwanted-raw-text'

describe('remove-unwanted-raw-text', () => {
  it('removes unwanted numbers from the text', async () => {
    const text = '1 3 567 Ala cat'

    const result = await removeUnwantedRawText(text)
    const expected = 'Ala cat'

    expect(result).toBe(expected)
  })

  it('removes unwanted stop words from the text', async () => {
    const text = 'Ala has a I\'ll be then cat'

    const result = await removeUnwantedRawText(text)
    const expected = 'Ala cat'

    expect(result).toBe(expected)
  })

  it('strips simple HTML markup', () => {
    const input = '<div id="abc">foo bar</div> hire<strong>some more</strong> loose<tags'
    const expected = 'foo bar hire loose<tags'

    const result = removeUnwantedRawText(input)

    expect(result).toEqual(expected)
  })

  it('strips urls', () => {
    const input = 'foo https://ramdajs.com/repl bar http://example.org hire'
    const expected = 'foo bar hire'

    const result = removeUnwantedRawText(input)

    expect(result).toEqual(expected)
  })
})
