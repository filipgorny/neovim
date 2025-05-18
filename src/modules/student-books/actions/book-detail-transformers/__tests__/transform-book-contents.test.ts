import { transformBookContents } from '../transform-book-contents'

describe('transform-book-contents', () => {
  it('transforms file book contents', () => {
    const input = {
      book_contents: [
        {
          id: 42,
          delta_object: '{"foo": "bar"}',
          type: 'file',
          raw: null,
        },
      ],
    }
    const expected = { book_contents: [{ delta_object: null, foo: 'bar', id: 42, raw: null, type: 'file', url: undefined }] }

    const result = transformBookContents(input)

    expect(result).toEqual(expected)
  })

  it('transforms text book contents', () => {
    const input = {
      book_contents: [
        {
          id: 42,
          delta_object: '{"foo": "bar"}',
          type: 'main_text',
          raw: null,
        },
      ],
    }
    const expected = { book_contents: [{ delta_object: { foo: 'bar' }, id: 42, raw: null, type: 'main_text' }] }

    const result = transformBookContents(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if book contents not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          delta_object: '{"foo": "bar"}',
          type: 'main_text',
          raw: null,
        },
      ],
    }
    const expected = { foo: [{ delta_object: '{"foo": "bar"}', id: 42, raw: null, type: 'main_text' }] }

    const result = transformBookContents(input)

    expect(result).toEqual(expected)
  })
})
