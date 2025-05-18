import R from 'ramda'
import { fetchForFlashcardProficiencyGraph } from '../../student-book-content-flashcards/student-book-content-flashcard-repository'
import { StudentCourse } from '../../../types/student-course'
import { FlashcardPLevels } from '../../../../services/student-book-content-flashcards/flashcard-p-levels'

const findFlashcardsCountForLevel = (id, pLevel) => R.pipe(
  R.find(
    R.allPass([
      R.propEq('id', id),
      R.propEq('proficiency_level', pLevel),
    ])
  ),
  R.propOr(0, 'count'),
  Number
)

const prepareBookFlashcardData = data => book => R.pipe(
  () => R.repeat(0, FlashcardPLevels.maxLevel),
  R.addIndex(R.map)(
    (val, idx) => findFlashcardsCountForLevel(book.id, idx + 1)(data)
  )
)(true)

export const prepareFlashcardProficiencyResponse = data => R.pipe(
  R.uniqBy(R.prop('id')),
  R.map(
    R.applySpec({
      name: R.prop('name'),
      id: R.prop('id'),
      book_id: R.prop('book_id'),
      data: prepareBookFlashcardData(data),
    })
  )
)(data)

export default async (student, studentCourse: StudentCourse) => {
  const data = await fetchForFlashcardProficiencyGraph(student.id, studentCourse.id)

  return prepareFlashcardProficiencyResponse(data)
}
