import * as R from 'ramda'
import { bumpSiteActivity } from '../../../../services/site-activity/site-activity-service'
import { StudentCourse } from '../../../types/student-course'
import { ActivityTypeEnum } from '../activity-type/activity-type-enum'

type Payload = {
  duration: number,
  activity_type: ActivityTypeEnum,
}

export default async (user, payload: Payload, studentCourse: StudentCourse) => {
  const hasCourses = R.pathOr(false, ['attributes', 'has_courses'], user)

  if (!payload.activity_type) {
    payload.activity_type = ActivityTypeEnum.books
  }

  if (hasCourses) {
    await bumpSiteActivity(user, payload.duration, studentCourse, payload.activity_type)
  }

  return user
}
