import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { findStudentCourseTopics } from '../../student-course-topics/student-course-topics-repository'
import { transformDataForListView } from '../../student-course-topics/actions/helpers/list-transformers'

const isAllRead = items => (
  R.pipe(
    R.pluck('is_read'),
    R.all(R.equals(true)) // it is also true for empty array
  )(items)
)

const removeArtificialItems = R.map(
  R.over(
    R.lensProp('bookContentCourseTopics'),
    R.reject(
      R.propEq('is_artificial', true)
    )
  )
)

const setIsAllRead = R.map(
  item => ({
    ...item,
    is_all_read: isAllRead(item.bookContentCourseTopics),
  })
)

const buildHeatMap = R.pipe(
  R.prop('data'),
  removeArtificialItems,
  setIsAllRead
)

export default async (student, studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async () => findStudentCourseTopics({ order: { by: 'order', dir: 'asc' }, limit: { take: 5000, page: 1 } }, { search: undefined, student_course_id: studentCourse.id }),
    transformDataForListView,
    buildHeatMap,
  ])(true)
)
