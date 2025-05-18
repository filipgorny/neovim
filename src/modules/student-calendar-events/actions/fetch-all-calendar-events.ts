import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { find } from '../student-calendar-events-repository'
import { find as findStudentEndDateDays } from '../../student-course-end-date-days/student-course-end-date-days-repository'
import { find as findAllAvailableEndDateDays } from '../../course-end-date-days/course_end_date_days-repository'
import { findOne as findMcatDate } from '../../mcat-dates/mcat-dates-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { migrateVideosToStudentBookVideos } from '../../student-book-videos/student-book-videos-service'
import { CalendarEventType } from '../calendar-event-type'

const defaultQuery = ({
  order: {
    by: 'event_date',
    dir: 'asc',
  },
  limit: {
    page: 1,
    take: 1000,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

const fetchAllAvailableCourseEndDateDays = async () => (
  R.pipeWith(R.andThen)([
    async () => findAllAvailableEndDateDays({ limit: { page: 1, take: 1000 }, order: { by: 'class_date', dir: 'asc' } }, {}),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const fetchStudentCourseEndDateDays = async studentCourse => (
  R.pipeWith(R.andThen)([
    async studentCourse => findStudentEndDateDays({ limit: { page: 1, take: 1000 }, order: { by: 'id', dir: 'asc' } }, { student_course_id: studentCourse.id }, ['endDateDay']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

const fetchCalendarEvents = async (studentCourse: StudentCourse, query, sortByEvents = true) => R.pipeWith(R.andThen)([
  async () => find(prepareQuery(query), { student_course_id: studentCourse.id }, ['exam', 'examByItem']),
  R.prop('data'),
  collectionToJson,
  sortEvents(sortByEvents),
  R.map(
    R.omit(['student_course_id']) // this property is not needed in the response
  ),
  R.map(
    event => {
      return {
        ...event,
        exam: null, // this relation is not needed in the response
        examByItem: null, // this relation is not needed in the response
        student_exam_status: event.exam?.status || event.examByItem?.status, // add exam status so some events will be blocked
      }
    }
  ),
  R.objOf('data'),
])(true)

const groupAndSortByTitle = R.pipe(
  R.groupBy(
    R.prop('event_colour')
  ),
  R.map(
    R.sort(
      (a, b) => {
        const aNum = parseInt(a.title.match(/\d+/)[0], 10)
        const bNum = parseInt(b.title.match(/\d+/)[0], 10)
        return aNum - bNum
      }
    )
  ),
  R.values,
  R.flatten
)

const sortEvents = (sortByEvents = true) => items => {
  if (sortByEvents) {
    return R.sortWith([
      R.ascend(R.prop('event_date')),
      R.ascend(R.prop('order')),
    ])(items)
  }

  return groupAndSortByTitle(items)
}

const fetchParentEventIds = async studentCourse => (
  R.pipeWith(R.andThen)([
    async () => find(prepareQuery(defaultQuery), { student_course_id: studentCourse.id, type: CalendarEventType.customLiveClass }),
    R.prop('data'),
    collectionToJson,
    R.pluck('parent_event_id'),
    R.filter(R.identity),
  ])(true)
)

export default async (studentCourse: StudentCourse, query, sortByEvents = true) => {
  if (!studentCourse.videos_migrated) {
    setTimeout(migrateVideosToStudentBookVideos(studentCourse), 0)
  }

  const [calendarEvents, endDateDays, allAvailableEndDateDays, parentEventIds] = await Promise.all([
    fetchCalendarEvents(studentCourse, query, sortByEvents),
    fetchStudentCourseEndDateDays(studentCourse),
    fetchAllAvailableCourseEndDateDays(),
    fetchParentEventIds(studentCourse),
  ])

  const mcatDate = await findMcatDate({ id: studentCourse.mcat_date_id })

  return {
    available_end_date_days: allAvailableEndDateDays,
    end_date_days: endDateDays,
    calendar: {
      start_at: studentCourse.calendar_start_at,
      exam_at: studentCourse.exam_at,
      mcat_at: mcatDate ? mcatDate.mcat_date : null,
    },
    calendar_events: calendarEvents,
    parent_event_ids: parentEventIds,
  }
}
