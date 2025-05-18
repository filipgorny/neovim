import * as R from 'ramda'
import { stitchArraysByProp } from '../../../../utils/array/stitch-arrays-by-prop'
import { StudentCourse } from '../../../types/student-course'
import { findExamsByBookChapters, findOneOrFail } from '../student-book-repository'
import { find as findAttachedExams } from '../../student-attached-exams/student-attached-exam-repository'
import { findOne as findExam } from '../../student-exams/student-exam-repository'
import { AttachedExamTypeEnum } from '../../attached-exams/attached-exam-types'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { StudentCourseTypes } from '../../student-courses/student-course-types'

const attachExamData = record => R.set(R.lensProp('assigned_exam'), {
  status: record.status,
  id: record.student_exam_id,
  is_available: record.is_available,
  title: record.exam_title,
})(record)

const transformData = R.map(
  R.pipe(
    R.ifElse(
      R.propSatisfies(R.isNil, 'student_exam_id'),
      R.mergeLeft({ assigned_exam: null }),
      attachExamData
    ),
    R.omit(['student_exam_id', 'status', 'is_available', 'exam_title'])
  )
)

const findExams = (student_id: string, student_course_id?: string) => async (id: string) => (
  findExamsByBookChapters(id, student_id, student_course_id)
)

const getChaptersFromBook = R.pipe(
  R.prop('chapters'),
  R.map(
    R.mergeLeft({ assigned_exam: null })
  )
)

const getAttachedExams = courseId => async (bookId) => {
  const entries = await findAttachedExams({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, {
    course_id: courseId,
    original_attached_id: bookId,
    type: AttachedExamTypeEnum.book,
  }, ['exam'])

  return R.pipe(
    R.prop('data'),
    collectionToJson
  )(entries)
}

const findFreeTrialExam = R.pipe(
  R.pluck('exam'),
  R.filter(
    R.propEq('is_free_trial', true)
  ),
  R.head
)

const markExamInFirstChapterOfFreeTrialAsAvailable = (studentCourse: StudentCourse) => item => {
  if (studentCourse.type !== StudentCourseTypes.freeTrial) {
    return item
  }

  if (item.order === 1) {
    item.assigned_exam.is_available = true
  }

  return item
}

export default async (user, id: string, studentCourse: StudentCourse) => {
  const book = await findOneOrFail({ id }, ['chapters'])
  const chapters = getChaptersFromBook(book)
  const chaptersWithExams = await R.pipeWith(R.andThen)([
    findExams(user.id, studentCourse.id),
    transformData,
    R.map(markExamInFirstChapterOfFreeTrialAsAvailable(studentCourse)),
  ])(id)

  const freeTrialExam = studentCourse
    ? await R.pipeWith(R.andThen)([
      getAttachedExams(studentCourse.id),
      findFreeTrialExam,
    ])(book.book_id)
    : []

  return {
    chapters: stitchArraysByProp('id', chapters, chaptersWithExams),
    freeTrialExam,
  }
}
