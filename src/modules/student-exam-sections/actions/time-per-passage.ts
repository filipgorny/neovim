import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail } from '../student-exam-section-repository'
import { extractSection } from '../../student-exams/actions/helpers/helpers'
import { stitchArraysByProp } from '../../../../utils/array/stitch-arrays-by-prop'
import { embedKeyAsProp } from '../../../../utils/object/embed-key-as-prop'

// todo refactor and simplify along with time-per-questions

const findSection = async id => (
  findOneOrFail({
    id,
  }, ['exam.sections.passages'])
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

const extractPassagesForSection = sectionId => R.pipe(
  extractSection(sectionId),
  R.prop('sections'),
  R.head,
  R.prop('passages'),
  R.map(
    R.omit(['content', 'student_section_id'])
  )
)

export default async (student, sectionId) => {
  const section = await findSection(sectionId)

  R.unless(
    R.pathEq(['exam', 'student_id'], student.id),
    () => throwException(customException('Student ID mismatch', 403))
  )(section)

  return stitchArraysByProp(
    'original_exam_passage_id',
    extractPassageTimers(section),
    extractPassagesForSection(sectionId)(section)
  )
}
