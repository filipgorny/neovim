import * as R from 'ramda'
import { evalCollectionProp, renameProps, stitchArraysByProp } from '@desmart/js-utils'
import { find as findCalendarChapterExams } from '../calendar-chapter-exams-repository'
import { find as findCourse } from '../../courses/course-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const getNumericPart = R.pipe(
  R.split(' '),
  R.filter(R.test(/\d+/)),
  R.map(Number)
)

const compareByTitleNum = (a, b) => {
  const numA = getNumericPart(a.title)[0] || 0
  const numB = getNumericPart(b.title)[0] || 0
  return numA - numB
}

const getAllExams = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async course_id => findCourse({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { id: course_id }, ['books.chapters.attached.exam']),
    R.prop('data'),
    collectionToJson,
    R.head,
    R.prop('books'),
    extractAttachedExams,
    R.sortWith([
      R.ascend(R.prop('book_tag')),
      compareByTitleNum,
    ]),
  ])(course_id)
)

const addSectionCount = R.pipe(
  evalCollectionProp('section_count', R.pipe(
    R.prop('exam_length'),
    JSON.parse,
    R.prop('summary'),
    R.prop('sectionCount')
  ))
)

const addDuration = R.pipe(
  evalCollectionProp('exam_duration', R.pipe(
    R.prop('exam_length'),
    JSON.parse,
    R.prop('summary'),
    R.prop('minutes')
  ))
)

const prepareExams = R.pipe(
  R.map(
    renameProps({ id: 'exam_id' })
  ),
  addSectionCount,
  addDuration
)

const embedChapterAndBookInfo = R.forEachObjIndexed(
  (book, i) => {
    R.forEachObjIndexed(
      (chapter, j) => {
        if (chapter.attached?.exam) {
          book.chapters[j].attached.exam.book_tag = book.tag
          book.chapters[j].attached.exam.book_tag_colour = book.tag_colour
          book.chapters[j].attached.exam.chapter_title = chapter.title
        }
      }
    )(book.chapters)
  }
)

const extractAttachedExams = R.pipe(
  embedChapterAndBookInfo,
  R.pluck('chapters'),
  R.flatten,
  R.reject(
    R.propSatisfies(R.isNil, 'attached')
  ),
  R.pluck('attached'),
  R.filter(
    R.propSatisfies(type => type === 'chapter', 'type')
  ),
  R.pluck('exam')
)

export default async (course_id: string) => {
  const allExams = await R.pipeWith(R.andThen)([
    getAllExams,
    prepareExams,
    R.filter(
      R.propEq('exam_duration', 30)
    ),
  ])(course_id)

  const calendarSectionExams = await findCalendarChapterExams({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { course_id })

  return R.pipe(
    R.prop('data'),
    collectionToJson,
    evalCollectionProp('in_calendar', R.always(true)),
    stitchArraysByProp('exam_id', allExams)
  )(calendarSectionExams)
}
