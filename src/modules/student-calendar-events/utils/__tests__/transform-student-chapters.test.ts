import { transformStudentChapters, transformStudentChaptersForLiveClass } from '../transform-student-chapters'

describe('transform-student-chapters', () => {
  it('transforms book chapters to create calendar events from them', () => {
    const books = [
      {
        tag: 'ABC',
        tag_colour: 'red',
        book_id: 'foo-bar',
        id: 'abc-def',
        chapters: [
          {
            original_chapter_id: '123-qwe',
            id: '456-asd',
            title: 'chapter title 1',
          },
        ],
      },
      {
        tag: null,
        tag_colour: null,
        book_id: 'bar-baz',
        id: 'qwe-asd',
        chapters: [
          {
            original_chapter_id: '987-asd',
            id: 'abc-lkj',
            title: 'chapter title 3',
          },
          {
            original_chapter_id: '567-fgh',
            id: 'ghj-ert',
            title: 'chapter title 5',
          },
        ],
      },
    ]

    const expected = {
      '123-qwe':
        {
          original_book_id: 'foo-bar',
          student_book_chapter_id: '456-asd',
          student_book_id: 'abc-def',
          tag: 'ABC',
          tag_colour: 'red',
          title: 'chapter title 1',
        },
      '567-fgh':
        {
          original_book_id: 'bar-baz',
          student_book_chapter_id: 'ghj-ert',
          student_book_id: 'qwe-asd',
          tag: '(no tag)',
          tag_colour: '',
          title: 'chapter title 5',
        },
      '987-asd':
        {
          original_book_id: 'bar-baz',
          student_book_chapter_id: 'abc-lkj',
          student_book_id: 'qwe-asd',
          tag: '(no tag)',
          tag_colour: '',
          title: 'chapter title 3',
        },
    }

    const result = transformStudentChapters(books)

    expect(result).toEqual(expected)
  })

  it('transforms book chapters to create calendar events from them (live class)', () => {
    const books = [
      {
        tag: 'ABC',
        tag_colour: 'red',
        book_id: 'foo-bar',
        id: 'abc-def',
        chapters: [
          {
            original_chapter_id: '123-qwe',
            order: 1,
            id: '456-asd',
            title: 'chapter title 1',
            subchapters: [],
          },
        ],
      },
      {
        tag: null,
        tag_colour: null,
        book_id: 'bar-baz',
        id: 'qwe-asd',
        chapters: [
          {
            original_chapter_id: '987-asd',
            order: 2,
            id: 'abc-lkj',
            title: 'chapter title 3',
            subchapters: [],
          },
          {
            original_chapter_id: '567-fgh',
            order: 1,
            id: 'ghj-ert',
            title: 'chapter title 5',
            subchapters: [],
          },
        ],
      },
    ]

    const expected = {
      '123-qwe':
        {
          original_book_id: 'foo-bar',
          student_book_chapter_id: '456-asd',
          student_book_id: 'abc-def',
          tag: 'ABC',
          tag_colour: 'red',
          title: 'chapter title 1',
          order: 1,
          subchapters: [],
        },
      '567-fgh':
        {
          original_book_id: 'bar-baz',
          student_book_chapter_id: 'ghj-ert',
          student_book_id: 'qwe-asd',
          tag: '(no tag)',
          tag_colour: '',
          title: 'chapter title 5',
          order: 1,
          subchapters: [],
        },
      '987-asd':
        {
          original_book_id: 'bar-baz',
          student_book_chapter_id: 'abc-lkj',
          student_book_id: 'qwe-asd',
          tag: '(no tag)',
          tag_colour: '',
          title: 'chapter title 3',
          order: 2,
          subchapters: [],
        },
    }

    const result = transformStudentChaptersForLiveClass(books)

    expect(result).toEqual(expected)
  })
})
