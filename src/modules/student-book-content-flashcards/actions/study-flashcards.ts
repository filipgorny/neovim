import R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { fetchFlashcardsToStudy, fetchPLevelStats } from '../student-book-content-flashcard-repository'
import { shuffleStudentFlashcards } from '../student-book-content-flashcard-service'
import { mapStudentFlashcard } from './fetch-all-flashcards'

const defaultQuery = ({
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export default async (studentId, query, studentCourse: StudentCourse) => {
  const finalQuery = prepareQuery(query)
  const shuffle = query.shuffle
  const pLevelStats = await fetchPLevelStats(studentId, studentCourse, query.part)(finalQuery.filter)

  if ([true, 'true'].includes(shuffle)) {
    await shuffleStudentFlashcards(studentId)
  }

  return R.pipeWith(R.andThen)([
    async () => fetchFlashcardsToStudy(studentId, studentCourse, query.part)(finalQuery, finalQuery.filter),
    R.over(
      R.lensProp('data'),
      R.map(mapStudentFlashcard)
    ),
    R.assoc('p_level_stats', pLevelStats),
  ])(true)
}
