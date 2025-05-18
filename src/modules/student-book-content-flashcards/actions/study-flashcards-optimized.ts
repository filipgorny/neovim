import * as R from 'ramda'
import { int } from '../../../../utils/number/int'
import { StudentCourse } from '../../../types/student-course'
import { fetchFlashcardsToStudyOptimized } from '../student-book-content-flashcard-repository'
import { mapStudentFlashcard } from './fetch-all-flashcards'

const DEBUG_LABEL = 'STUDY FLASHCARDS MK II'

const defaultQuery = ({
  limit: {
    page: 1,
    take: 1,
  },
})

const prepareQuery = query => (
  R.pipe(
    R.mergeDeepLeft(
      R.__,
      defaultQuery
    )
  )(query)
)

const logTime = msg => R.tap(() => console.timeLog(DEBUG_LABEL, [msg]))

export default async (studentId, query, studentCourse: StudentCourse) => {
  console.time(DEBUG_LABEL)

  const finalQuery = prepareQuery(query)

  return R.pipeWith(R.andThen)([
    async () => fetchFlashcardsToStudyOptimized(studentId, studentCourse, query.part)(finalQuery, finalQuery.filter),
    logTime('after fetchFlashcardsToStudyOptimized'),
    R.over(
      R.lensProp('data'),
      R.map(mapStudentFlashcard)
    ),
    logTime('after transform'),
    R.tap(() => console.timeEnd(DEBUG_LABEL)),
  ])(true)
}
