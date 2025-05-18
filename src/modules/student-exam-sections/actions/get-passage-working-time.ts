import * as R from 'ramda'
import { extractSection } from '../../student-exams/actions/helpers/helpers'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail } from '../student-exam-section-repository'
import { stitchArraysByProp } from '../../../../utils/array/stitch-arrays-by-prop'
import { embedKeyAsProp } from '../../../../utils/object/embed-key-as-prop'

const findSection = async id => (
  findOneOrFail({
    id,
  }, ['exam.sections.passages.questions'])
)

const appendQuestionAmount = item => (
  R.pipe(
    R.path(['questions', 'length']),
    R.objOf('question_amount'),
    R.mergeLeft(item)
  )(item)
)

const extractPassagesForSection = sectionId => R.pipe(
  extractSection(sectionId),
  R.prop('sections'),
  R.head,
  R.prop('passages'),
  R.map(appendQuestionAmount),
  R.map(
    R.omit(['content', 'student_section_id', 'questions'])
  ),
  R.sortBy(R.prop('order'))
)

const filterPassagesOnly = R.filter(
  R.propEq('resource_type', 'passage')
)

const extractPassageTimers = R.pipe(
  R.path(['exam', 'timers']),
  JSON.parse,
  embedKeyAsProp('original_exam_passage_id'),
  filterPassagesOnly
)

const rejectEmptyPassages = R.reject(
  R.propEq('question_amount', 0)
)

export default async (student, sectionId) => {
  const section = await findSection(sectionId)

  R.unless(
    R.pathEq(['exam', 'student_id'], student.id),
    () => throwException(customException('Student ID mismatch', 403))
  )(section)

  return R.pipe(
    R.juxt([
      extractPassagesForSection(sectionId),
      extractPassageTimers,
    ]),
    R.apply(stitchArraysByProp('original_exam_passage_id')),
    // @ts-ignore
    rejectEmptyPassages
    // @ts-ignore
  )(section)
}
