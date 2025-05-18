import * as R from 'ramda'
import { evalCollectionProp, renameProps, stitchArraysByProp } from '@desmart/js-utils'
import { find as findCalendarFullExams } from '../calendar-full-exams-repository'
import { find as findCourse } from '../../courses/course-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { StudentCourse } from '../../../types/student-course'
import { find as findEvents } from '../../student-calendar-events/student-calendar-events-repository'

const getAllExams = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async course_id => findCourse({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { id: course_id }, ['attached.exam']),
    R.prop('data'),
    collectionToJson,
    R.head,
    R.prop('attached'),
    R.pluck('exam'),
    R.sortBy(R.prop('title')),
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

const markItemsAsPresentInCalendar = (idsInCalendar = [], data = []) => (
  R.pipe(
    R.map(
      exam => {
        if (idsInCalendar.includes(exam.exam_id)) {
          exam.present_in_calendar = true
        }

        return exam
      }
    ),
    R.sortBy(R.prop('title'))
  )(data)
)

const markCustomEventsPresentInCalendar = async (data, studentCourse: StudentCourse) => {
  const eventIds = await R.pipeWith(R.andThen)([
    async () => findEvents({ limit: { page: 1, take: 1000 }, order: { by: 'event_date', dir: 'asc' } }, { student_course_id: studentCourse.id }),
    R.prop('data'),
    collectionToJson,
    R.pluck('original_exam_id'),
    R.filter(R.identity),
  ])()

  return markItemsAsPresentInCalendar(eventIds, data)
}

export default async (course_id: string, studentCourse?: StudentCourse) => {
  const allExams = await R.pipeWith(R.andThen)([
    getAllExams,
    prepareExams,
    R.filter(
      R.propSatisfies(n => n >= 180 && n <= 375, 'exam_duration') // this includes both FL and half-length exams
    ),
  ])(course_id)

  const calendarFullExams = await findCalendarFullExams({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { course_id })

  const results = R.pipe(
    R.prop('data'),
    collectionToJson,
    stitchArraysByProp('exam_id', allExams)
  )(calendarFullExams)

  return studentCourse ? markCustomEventsPresentInCalendar(results, studentCourse) : results
}
