import * as R from 'ramda'
import { find } from '../student-courses-repository'
import { getFirstLiveCourseDay } from './utils/get-first-live-course-day'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

export default async (student, query) => {
  const courses = await find(

    query,
    { student_id: student.id, is_deleted: false },
    ['endDate.days', 'original']
  )

  const data = R.pipe(
    R.prop('data'),
    collectionToJson,
    R.map((course) => {
      course.endDateFirstDay = getFirstLiveCourseDay(course)

      return course
    })
  )(courses)

  return {
    data,
    meta: courses.meta,
  }
}
