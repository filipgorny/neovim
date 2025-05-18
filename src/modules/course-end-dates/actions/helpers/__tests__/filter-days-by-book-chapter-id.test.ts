import moment from 'moment'
import { filterByBookChapterId } from '../filter-days-by-book-chapter-id'

describe('filter-days-by-book-chapter-id', () => {
  it('filter only those days that have a specific book chapter id attached (it means they are live classes for specific event)', async () => {
    const data = [
      {
        days: [
          {
            id: 'foo',
            book_chapter_id: 'bar',
          },
          {
            id: 'qwe',
            book_chapter_id: 'sdf',
          },
          {
            id: 'plm',
            book_chapter_id: 'baz',
          },
        ],
      },
    ]

    const expected = [
      {
        days: [
          {
            id: 'qwe',
            book_chapter_id: 'sdf',
          },
        ],
      },
    ]

    const result = filterByBookChapterId('sdf')(data)

    expect(result).toEqual(expected)
  })

  it('remove items that result in empty day set', async () => {
    const data = [
      {
        days: [
          {
            id: 'foo',
            book_chapter_id: 'bar',
          },
          {
            id: 'qwe',
            book_chapter_id: 'sdf',
          },
          {
            id: 'plm',
            book_chapter_id: 'baz',
          },
        ],
      },
      {
        days: [
          {
            id: 'foo',
            book_chapter_id: 'bar',
          },
          {
            id: 'qwe',
            book_chapter_id: 'tfc',
          },
          {
            id: 'plm',
            book_chapter_id: 'baz',
          },
        ],
      },
    ]

    const expected = [
      {
        days: [
          {
            id: 'qwe',
            book_chapter_id: 'sdf',
          },
        ],
      },
    ]

    const result = filterByBookChapterId('sdf')(data)

    expect(result).toEqual(expected)
  })
})
