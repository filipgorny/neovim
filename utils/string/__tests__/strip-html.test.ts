import { stripHtml } from '../strip-html'

describe('strip-html', () => {
  it('returns plain text unchanged', () => {
    const input = 'foo bar'
    const expected = 'foo bar'

    const result = stripHtml(input)

    expect(result).toEqual(expected)
  })

  it('strips simple HTML markup', () => {
    const input = '<div id="abc">foo bar</div> and <strong>some more</strong>'
    const expected = 'foo bar and some more'

    const result = stripHtml(input)

    expect(result).toEqual(expected)
  })

  it('strips complex, nested HTML markup', () => {
    const input = '<div id="abc">foo bar</div> and <strong>some <i nested="attr" second-attr=42>more</i></strong>'
    const expected = 'foo bar and some more'

    const result = stripHtml(input)

    expect(result).toEqual(expected)
  })

  it('handles numbers properly', () => {
    const input = 42
    const expected = '42'

    const result = stripHtml(input)

    expect(result).toEqual(expected)
  })
})
