import moment from 'moment'
import * as R from 'ramda'
import { customException, throwException } from '../../../utils/error/error-factory'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { DATETIME_DATABASE_FORMAT, DATE_FORMAT_YMD } from '../../constants'
import { findOneOrFail as findCourseOrFail } from '../courses/course-repository'
import { create, find, findOne, patch } from './course-end-dates-repository'
import { validateEndDate } from './validation/validate-end-date'
import { validateDate } from './validation/validate-date'
import logger from '../../../services/logger/logger'
import { copyEndDateDays } from '../course-end-date-days/course_end_date_days-service'

export const eliminateTime = (date): string => moment(moment(date).format(DATE_FORMAT_YMD), DATE_FORMAT_YMD).format('YYYY-MM-DD HH:mm:ss.SSS') + ' +0000'

export const createCourseEndDate = async (course_id: string, start_date: string, end_date: string, calendar_image_url?: string, meeting_url?: string, semester_name?: string) => {
  validateEndDate(end_date)

  start_date = eliminateTime(start_date)
  end_date = eliminateTime(end_date)

  await findCourseOrFail({ id: course_id })

  const courseEndDate = await findOne({ course_id, end_date })

  if (courseEndDate) {
    throwException(customException('course-end-dates.already-exists', 403, 'Course end date already exists'))
  }

  return create({ course_id, start_date, end_date, calendar_image_url, meeting_url, semester_name })
}

export const patchEndDate = async (id: string, end_date: string) => {
  validateEndDate(end_date)

  end_date = eliminateTime(end_date)

  return patch(id, { end_date })
}

export const patchStartDate = async (id: string, start_date: string) => {
  validateDate(start_date)

  start_date = eliminateTime(start_date)

  return patch(id, { start_date })
}

export const patchCalendarImageUrl = async (id: string, calendar_image_url: string) => (
  patch(id, { calendar_image_url })
)

export const patchMeetingUrl = async (id: string, meeting_url: string) => (
  patch(id, { meeting_url })
)

export const patchSemesterName = async (id: string, semester_name: string) => (
  patch(id, { semester_name })
)

const sortByDatesAndHours = R.sortWith([
  R.ascend(R.prop('class_date')),
  R.ascend(R.prop('class_time')),
])

export const sortByDays = R.map(
  R.over(
    R.lensProp('days'),
    sortByDatesAndHours
  )
)

export const getCourseEndDatesForYear = async (course_id: string, year: string, { order = { by: 'end_date', dir: 'asc' } }: { order: { by: string, dir: 'asc' | 'desc' } }) => (
  R.pipeWith(R.andThen)([
    async () => findCourseOrFail({ id: course_id }),
    async () => find(
      { limit: { page: 1, take: 100 }, order: { by: order.by, dir: order.dir } },
      function () {
        this.where({ course_id }).whereRaw('EXTRACT(YEAR FROM end_date) = ?', [year])
      }, ['days']
    ),
    R.prop('data'),
    collectionToJson,
    sortByDays,
  ])(true)
)

export const getAllCourseEndDates = async (course_id: string, { order = { by: 'end_date', dir: 'asc' } }: { order: { by: string, dir: 'asc' | 'desc' } }) => (
  R.pipeWith(R.andThen)([
    async () => findCourseOrFail({ id: course_id }),
    async () => find(
      { limit: { page: 1, take: 100 }, order: { by: order.by, dir: order.dir } },
      function () {
        this.where({ course_id })
      }
    ),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const getCourseEndDates = async (course_id: string, { order = { by: 'end_date', dir: 'asc' } }: { order: { by: string, dir: 'asc' | 'desc' } }) => (
  R.pipeWith(R.andThen)([
    async () => findCourseOrFail({ id: course_id }),
    async () => find(
      { limit: { page: 1, take: 100 }, order: { by: order.by, dir: order.dir } },
      function () {
        this.where({ course_id }).whereRaw('end_date >= ?', [moment(moment().format(DATE_FORMAT_YMD)).format(DATETIME_DATABASE_FORMAT)])
      }
    ),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const getEndDate = async (course_id: string, end_date) => {
  logger.info('getEndDate', { course_id, end_date })
  end_date = eliminateTime(end_date)
  logger.info('eliminateTime(end_date)', { end_date })

  const courseEndDate = await findOne({ course_id, end_date })

  return courseEndDate
}

export const getStudentsByEndDate = async (course_id: string, end_date: string) => {
  const course = await findCourseOrFail({ id: course_id }, ['studentCourses.student'])

  return R.pipe(
    R.prop('studentCourses'),
    R.filter(
      studentCourse => eliminateTime(studentCourse.original_end_date) === eliminateTime(end_date)
    ),
    R.map(R.prop('student'))
  )(course)
}

export const copyEndDateForNewCourse = (newCourseId: string, newTutors: []) => async (endDate) => {
  const newEndDate = await create(R.omit(['id', 'days'])({
    ...endDate,
    course_id: newCourseId,
  }))

  await copyEndDateDays(newEndDate.id, endDate.days, collectionToJson(newTutors))

  return newEndDate
}
