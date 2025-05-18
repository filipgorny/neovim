import * as R from 'ramda'
import { findOneOrFail as findStudentBookChapter } from '../../student-book-chapters/student-book-chapter-repository'
import { getCourseEndDatesForYear } from '../course-end-dates-service'
import { StudentCourse } from '../../../types/student-course'
import { findLiveClassEvents } from '../../student-calendar-events/student-calendar-events-repository'
import { transformLiveClassEvents } from './helpers/transform-live-class-events'
import { markEndDatesPresentInCalendar } from './helpers/mark-course-end-date-days-present-in-calendar'
import { filterByBookChapterId } from './helpers/filter-days-by-book-chapter-id'
import moment from 'moment'

const embedEndDateInDays = R.map(
  course => (
    R.over(
      R.lensProp('days'),
      R.map(
        day => ({
          ...day,
          end_date: course.end_date,
        })
      )
    )(course)
  )
)

const rejectDaysAfterAccessibleTo = (studentCourse: StudentCourse) => data => {
  if (!studentCourse) {
    return data
  }

  const accessibleTo = moment(studentCourse.accessible_to)

  return R.map(
    course => (
      R.over(
        R.lensProp('days'),
        R.reject(
          R.propSatisfies(
            class_date => moment(class_date).isAfter(accessibleTo),
            'class_date'
          )
        )
      )(course)
    )
  )(data)
}

export default async (course_id: string, year: string, query: { order: { by: string, dir: 'asc' | 'desc' }, student_book_chapter_id?: string}, studentCourse?: StudentCourse) => {
  let courseEndDateDayIds = []

  // If there is a student course in the request, we need to find the live class events for the course
  // if an course day is already a live class event, we need to mark it as such
  if (studentCourse) {
    const liveClassEvents = await findLiveClassEvents(studentCourse.id)

    courseEndDateDayIds = transformLiveClassEvents(liveClassEvents)
  }

  const results = await R.pipeWith(R.andThen)([
    async () => getCourseEndDatesForYear(course_id, year, query),
    embedEndDateInDays,
    markEndDatesPresentInCalendar(courseEndDateDayIds, studentCourse),
    rejectDaysAfterAccessibleTo(studentCourse),
  ])(true)

  if (!query.student_book_chapter_id) {
    return results
  }

  const chapter = await findStudentBookChapter({ id: query.student_book_chapter_id }, [])

  return filterByBookChapterId(chapter.original_chapter_id)(results)
}
