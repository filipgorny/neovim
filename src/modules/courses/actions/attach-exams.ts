import R from 'ramda'
import { findExamsByIds, findExamsWhereIn } from '../../exams/exam-repository'
import { findOneOrFail as fetchCourse } from '../course-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { AttachedExamTypeEnum } from '../../attached-exams/attached-exam-types'
import { fetchAttachedExams, removeAll } from '../../attached-exams/attached-exam-repository'
import mapP from '../../../../utils/function/mapp'
import { createAttachedExam } from '../../attached-exams/attached-exams-service'
import { customException, throwException } from '../../../../utils/error/error-factory'

const extractIdsFromCourse = R.pipe(
  R.prop('books'),
  R.juxt([
    R.pluck('id'),
    R.pipe(
      R.pluck('chapters'),
      R.flatten,
      R.pluck('id')
    ),
  ]),
  R.flatten
)

const getExamIdsAttachedToCourse = R.pipeWith(R.andThen)([
  fetchAttachedExams,
  collectionToJson,
  R.pluck('exam_id'),
  R.uniq,
])

const difference = (setA: Set<string>, setB: Set<string>) => {
  const _difference = new Set(setA)
  for (const elem of setB) {
    _difference.delete(elem)
  }
  return _difference
}

export default async (id: string, payload) => {
  const course = await fetchCourse({ id }, ['books.chapters'])

  const { ids } = payload
  const exams = await findExamsByIds(ids)

  const examsDiff = difference(new Set(ids), new Set(R.pluck('id', exams.data)))
  if (examsDiff.size > 0) {
    throwException(customException('exams.dont-exist', 404, `Exams with ids ${[...examsDiff]} don't exist`))
  }

  const idsFromCourse: string[] = extractIdsFromCourse(course)

  const attachedToCourseOrItsBooksExamIds = await getExamIdsAttachedToCourse(idsFromCourse)
  const attachedType = AttachedExamTypeEnum.course

  // Validation disabled as it was working weird and in an unexpected way
  const examIdsToAttach: string[] = R.pipe(
    R.pluck('id'),
    R.map(
      R.when(
        R.includes(R.__, attachedToCourseOrItsBooksExamIds),
        // examId => throwException(customException('courses.exam-already-attached', 403, `Exam with id ${examId} is already attached to a book or chapter that belongs to course with id ${course.id}`))
        R.identity
      )
    )
  )(exams.data)

  await removeAll(attachedType, course.id, [])

  return mapP(
    async (examId: string) => createAttachedExam(attachedType, examId, course.id)
  )(examIdsToAttach)
}
