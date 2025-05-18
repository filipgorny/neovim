import * as R from 'ramda'
import { customException, int, throwException } from '@desmart/js-utils'
import { find as findCourseTopics } from '../course-topics-repository'

export const validateCourseTopicsDoNotExist = async (course_id: string) => {
  const courseTopics = await findCourseTopics({ limit: { take: 1, page: 1 }, order: { by: 'id', dir: 'desc' } }, { course_id })

  R.pipe(
    R.path(['meta', 'recordsTotal']),
    int,
    R.unless(
      R.equals(0),
      () => throwException(customException('course-topics.already-exist', 400, 'Course topics already exist'))
    )
  )(courseTopics)
}
