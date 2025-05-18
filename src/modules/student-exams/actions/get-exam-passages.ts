import * as R from 'ramda'
import { findOneOrFail } from '../student-exam-repository'
import { customException, throwException } from '../../../../utils/error/error-factory'

const formatOutput = section => passages => (
  {
    id: section.id,
    title: section.title,
    order: section.order,
    section_status: section.section_status,
    passages: passages
  }
)

const sortByOrder = data => (
  R.sortBy(
    R.prop('order')
  )(data)
)

const orderPassage = R.pipe(
  R.prop('passages'),
  sortByOrder,
  R.map(
    R.pick(['id', 'order', 'original_exam_passage_id'])
  )
)

const orderBySection = section => (
  R.pipe(
    orderPassage,
    formatOutput(section)
  )(section)
)

const formatPassages = exam => R.pipe(
  R.prop('sections'),
  sortByOrder,
  R.map(orderBySection)
)(exam)

export default async (student, examId) => {
  const exam = await findOneOrFail({
    id: examId
  }, ['sections.passages'])

  R.unless(
    R.propEq('id', student.id),
    () => throwException(customException('Student ID mismatch', 404))
  )(student)

  return formatPassages(exam)
}
