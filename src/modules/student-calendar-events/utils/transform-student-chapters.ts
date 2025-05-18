import * as R from 'ramda'

export const transformStudentChapters = books => (
  R.pipe(
    R.map(
      book => (
        R.map(
          chapter => (
            {
              [chapter.original_chapter_id]: {
                student_book_id: book.id,
                student_book_chapter_id: chapter.id,
                title: chapter.title,
                tag: book.tag || '(no tag)',
                tag_colour: book.tag_colour || '',
                original_book_id: book.book_id,
              },
            }
          )
        )(book.chapters)
      )
    ),
    R.flatten,
    R.mergeAll
  )(books)
)

export const transformStudentChaptersForLiveClass = books => (
  R.pipe(
    R.map(
      book => (
        R.map(
          chapter => (
            {
              [chapter.original_chapter_id]: {
                student_book_id: book.id,
                student_book_chapter_id: chapter.id,
                title: chapter.title,
                tag: book.tag || '(no tag)',
                tag_colour: book.tag_colour || '',
                original_book_id: book.book_id,
                order: chapter.order,
                subchapters: chapter.subchapters,
              },
            }
          )
        )(book.chapters)
      )
    ),
    R.flatten,
    R.mergeAll
  )(books)
)
