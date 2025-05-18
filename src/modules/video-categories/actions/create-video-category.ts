import { DELETED_AT, customException, throwException } from '@desmart/js-utils'
import { findOneOrFail as findEndDateOrFail } from '../../course-end-dates/course-end-dates-repository'
import { CourseMapTypes } from '../../course-map/course-map-types'
import { findOneOrFail as findCourseOrFail } from '../../courses/course-repository'
import VideoCategoryDTO from '../dto/video-category-dto'
import validateCategoryCourseEditionUnique from '../validation/validate-category-course-edition-unique'
import { create } from '../video-categories-repository'

export default async (payload: VideoCategoryDTO) => {
  if (payload.course_type === CourseMapTypes.liveCourse && !payload.end_date_id) {
    throwException(customException('video-categories.end-date-required', 400, 'End date is required for live courses'))
  }
  if (payload.end_date_id) {
    const endDate = await findEndDateOrFail({ id: payload.end_date_id })
    if (endDate.course_id !== payload.course_id) {
      throwException(customException('video-categories.end-date.does-not-belong-to-course', 400, 'End date does not belong to course'))
    }
  }
  await findCourseOrFail({ id: payload.course_id, [DELETED_AT]: null })
  await validateCategoryCourseEditionUnique(payload.title, payload.course_id, payload.course_type, payload.end_date_id)

  return create(payload)
}
