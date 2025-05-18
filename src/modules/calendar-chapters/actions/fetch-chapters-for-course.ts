import * as R from 'ramda'
import { find as findCalendarChapters } from '../calendar-chapters-repository'
import { find as findCourse } from '../../courses/course-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { renameProps, stitchArraysByProp } from '@desmart/js-utils'

const getAllChapters = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async course_id => findCourse({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { id: course_id }, ['courseBooks.book.chapters']),
    R.prop('data'),
    collectionToJson,
    R.head,
    R.prop('courseBooks'),
  ])(course_id)
)

const extractChapters = R.pipe(
  R.pluck('book'),
  R.map(
    R.pick(['chapters', 'tag', 'tag_colour'])
  ),
  R.map(
    book => (
      R.pipe(
        R.prop('chapters'),
        R.map(
          chapter => ({
            ...chapter,
            tag: book.tag,
            tag_colour: book.tag_colour,
          })
        ),
        R.sortBy(R.prop('order'))
      )(book)
    )
  ),
  R.flatten,
  R.map(
    renameProps({ id: 'chapter_id', order: 'chapter_order' })
  )
)

export default async (course_id: string) => {
  const courseBooks = await getAllChapters(course_id)

  const allChapters = extractChapters(courseBooks)

  const calendarChapters = await findCalendarChapters({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { course_id })

  return R.pipe(
    R.prop('data'),
    collectionToJson,
    stitchArraysByProp('chapter_id', allChapters)
  )(calendarChapters)
}
