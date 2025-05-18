import * as R from 'ramda'
import { findOneOrFail } from '../course-repository'

const extractFirstChapterId = R.map(
  R.pipe(
    R.juxt([
      R.omit(['book']),
      R.pipe(
        R.path(['book', 'chapters']),
        R.find(chapter => chapter.order === 1),
        R.prop('id'),
        R.objOf('original_first_chapter_id')
      ),
    ]),
    R.mergeAll
  )
)

export default async (id: string) => {
  const course = await findOneOrFail({ id }, ['courseBooks.book.chapters'])

  return extractFirstChapterId(course.courseBooks)
}
