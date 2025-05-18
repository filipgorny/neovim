import * as R from 'ramda'
import { Moment } from 'moment'
import { StudentCourse } from '../../../types/student-course'
import { buildBookEventsFromChapters } from './book-events-builder'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find as findCalendarChapters } from '../../calendar-chapters/calendar-chapters-repository'
import { scheduleCalendarEventsPreReading } from '../../../../services/student-calendar-events/schedule-events-coles-algorithm-pre-reading'
import { find as findEndDateDays } from '../../course-end-date-days/course_end_date_days-repository'
import { renameProps, stitchArraysByPropStrict } from '@desmart/js-utils'
import { deleteIncompletePreReadingCalendarEvents, deletePreReadingCalendarEvents } from '../student-calendar-events-service'

const DEFAULT_PRIORITY_DAYS = [6, 0, 1, 4, 2, 3, 7]

const flattenAndDivideEventSchedule = R.pipe(
  R.pluck('tasks'),
  R.flatten,
  R.juxt([
    R.filter(
      R.propEq('type', 'exam')
    ),
    R.filter(
      R.propEq('type', 'task')
    ),
  ])
)

const getCalendarChapters = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findCalendarChapters({ limit: { page: 1, take: 1000 }, order: { by: 'order', dir: 'asc' } }, { course_id: studentCourse.book_course_id }, ['chapter.book', 'chapter.attached', 'chapter.subchapters.contents']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const filterBookChapters = R.reject(
  R.propSatisfies(book_chapter_id => R.isNil(book_chapter_id), 'book_chapter_id')
)

const getEndDateDays = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findEndDateDays({ limit: { page: 1, take: 1000 }, order: { by: 'class_date', dir: 'asc' } }, { end_date_id: studentCourse.end_date_id }),
    R.prop('data'),
    collectionToJson,
    filterBookChapters,
    R.map(
      renameProps({ book_chapter_id: 'chapter_id' })
    ),
  ])(studentCourse)
)

export const buildPreReadingCalendarEventsForMCAT = async (studentCourse: StudentCourse, dateStart: Moment, dateEnd: Moment, debug = false, reschedule = false, isReset = false) => {
  const endDateDays = await getEndDateDays(studentCourse)

  const [calendarChapters] = await Promise.all([
    getCalendarChapters(studentCourse),
  ])

  if (isReset) {
    await deletePreReadingCalendarEvents(studentCourse)
  } else {
    await deleteIncompletePreReadingCalendarEvents(studentCourse)
  }

  const calendarChaptersSubset = stitchArraysByPropStrict('chapter_id', calendarChapters, endDateDays)

  const prioridays = (studentCourse.prioridays || DEFAULT_PRIORITY_DAYS) as number[]

  const eventSchedule = scheduleCalendarEventsPreReading({
    startDate: dateStart,
    endDate: dateEnd,
    prioridays: prioridays,
    numTasks: calendarChaptersSubset.length,
    numTests: 0,
    isPreReading: true,
  }, debug)

  const [_, chapterScheduleEvents] = flattenAndDivideEventSchedule(eventSchedule)

  await buildBookEventsFromChapters(chapterScheduleEvents, calendarChaptersSubset, studentCourse, reschedule, false, true, true)
}
