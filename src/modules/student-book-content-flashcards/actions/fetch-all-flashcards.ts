import R from 'ramda'
import { codeFromFlashcard } from '../../../../services/flashcards/code-from-flashcard'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { findStudentFlashcards } from '../student-book-content-flashcard-repository'

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

export const mapStudentFlashcard = R.evolve({
  question_image: generateStaticUrl,
  explanation_image: generateStaticUrl,
  code: codeFromFlashcard,
  tags: value => value ? JSON.parse(value) : value,
})

export default async (studentId: string, query, studentCourse) => (
  R.pipeWith(R.andThen)([
    async () => findStudentFlashcards(studentId, studentCourse, query.part)(prepareQuery(query), query.filter),
    R.over(
      R.lensProp('data'),
      R.map(mapStudentFlashcard)
    ),
  ])(true)
)
