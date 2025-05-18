import { customException, throwException } from '@desmart/js-utils'
import { findOne } from '../video-categories-repository'
import { CourseMapTypes } from '../../course-map/course-map-types'

export default async (title: string, course_id: string, course_type: CourseMapTypes, end_date_id?: string) => {
  const videoCategory = await findOne({ title, course_id, course_type, end_date_id: end_date_id || null })

  if (videoCategory) {
    throwException(customException('video-categories.already-exists', 403, 'Video category already exists'))
  }
}
