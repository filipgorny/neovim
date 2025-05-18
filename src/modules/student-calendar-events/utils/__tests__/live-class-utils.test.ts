import { getCalendarEventTitle, getActionUri } from '../live-class-utils'

describe('live-class-utils', () => {
  it('getCalendarEventTitle - should return a proper title', () => {
    const studentChapters = {
      'foo-bar': {
        tag: 'Test',
        order: 2,
      },
    }

    const result = getCalendarEventTitle('foo-bar', studentChapters)

    expect(result).toBe('Test_2')
  })

  it('getCalendarEventTitle - returns ? when chapter not found', () => {
    const studentChapters = {
      'foo-bar': {
        tag: 'Test',
        order: 2,
      },
    }

    const result = getCalendarEventTitle('bar-baz', studentChapters)

    expect(result).toBe('?')
  })

  it('getActionUri - should return a meeting url, if defined', () => {
    const studentChapters = {
      'foo-bar': {
        tag: 'Test',
        order: 2,
      },
    }

    const result = getActionUri('foo-bar', studentChapters, 'https://example.com')

    expect(result).toBe('https://example.com')
  })

  it('getActionUri - should return a book url, if no meeting url attached', () => {
    const studentChapters = {
      'foo-bar': {
        original_book_id: 'foo-bar-baz',
        tag: 'Test',
        order: 3,
      },
    }

    const result = getActionUri('foo-bar', studentChapters, null)

    expect(result).toBe('/books/foo-bar-baz/chapter/3/part/1')
  })

  it('getActionUri - should return ? if chapter not found', () => {
    const studentChapters = {
      'foo-bar': {
        original_book_id: 'foo-bar-baz',
        tag: 'Test',
        order: 3,
      },
    }

    const result = getActionUri('bar-baz', studentChapters)

    expect(result).toBe('?')
  })
})
