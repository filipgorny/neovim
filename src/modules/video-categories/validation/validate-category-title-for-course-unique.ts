import { customException, throwException } from '@desmart/js-utils'
import { findOne } from '../video-categories-repository'

export default async (title: string, course_id: string) => {
  const videoCategory = await findOne({ title, course_id })

  if (videoCategory) {
    throwException(customException('video-categories.title-already-exists-for-this-course', 403, `Video category with title ${title} already exists for this course`))
  }
}
