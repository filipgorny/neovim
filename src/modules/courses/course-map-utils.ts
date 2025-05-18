import moment from 'moment'
import * as R from 'ramda'
import { DATE_FORMAT_YMD } from '../../constants'
import { CourseMapEntry } from '../../types/course-map-entry'
import { CourseMapTypes } from '../course-map/course-map-types'
import { StudentCourseStatus } from '../student-courses/student-course-status'
import { StudentCourseTypes } from '../student-courses/student-course-types'

export const courseStatusFromCourseMapEntry = (courseMapEntry: CourseMapEntry): StudentCourseStatus => (
  courseMapEntry.type === CourseMapTypes.onDemandCourse ? StudentCourseStatus.scheduled : StudentCourseStatus.ongoing
)

export const courseTypeFromCourseMapEntry = (courseMapEntry: CourseMapEntry): StudentCourseTypes => (
  R.pipe(
    R.prop('type'),
    R.cond([
      [R.equals(CourseMapTypes.freeTrial), R.always(StudentCourseTypes.freeTrial)],
      [R.equals(CourseMapTypes.liveCourse), R.always(StudentCourseTypes.liveCourse)],
      [R.equals(CourseMapTypes.onDemandCourse), R.always(StudentCourseTypes.onDemand)],
      [R.T, R.always(StudentCourseTypes.onDemand)],
    ])
  )(courseMapEntry)
)

export const courseAccessibleFromByCourseMapEntry = (courseMapEntry: CourseMapEntry, externalCreatedAt) => (
  courseMapEntry.type === CourseMapTypes.onDemandCourse ? null : externalCreatedAt
)

const addNDaysToDate = date => n => (
  moment(date).add(n, 'days').format(DATE_FORMAT_YMD)
)

export const courseAccessibleToByCourseMapEntry = (courseMapEntry: CourseMapEntry, externalCreatedAt) => (
  R.cond([
    [R.propEq('type', CourseMapTypes.freeTrial), R.pipe(
      R.prop('metadata'),
      JSON.parse,
      R.prop('days_amount'),
      addNDaysToDate(externalCreatedAt)
    )],
    [R.propEq('type', CourseMapTypes.liveCourse), R.pipe(
      R.prop('metadata'),
      JSON.parse,
      R.prop('expires_at'),
      date => moment(date).format(DATE_FORMAT_YMD)
    )],
    [R.T, R.always(null)],
  ])(courseMapEntry)
)

export const courseAccessibleToByCourseMapEntryForFreeTrialUpgrade = (courseMapEntry: CourseMapEntry, externalCreatedAt) => (
  R.cond([
    [R.propEq('type', CourseMapTypes.onDemandCourse), R.pipe(
      R.prop('metadata'),
      JSON.parse,
      R.prop('days_amount'),
      addNDaysToDate(externalCreatedAt)
    )],
    [R.propEq('type', CourseMapTypes.liveCourse), R.pipe(
      R.prop('metadata'),
      JSON.parse,
      R.prop('expires_at'),
      date => moment(date).format(DATE_FORMAT_YMD)
    )],
    [R.propEq('type', CourseMapTypes.freeTrial), R.pipe(
      R.prop('metadata'),
      JSON.parse,
      R.prop('days_amount'),
      addNDaysToDate(externalCreatedAt)
    )],
    [R.T, R.always(null)],
  ])(courseMapEntry)
)
