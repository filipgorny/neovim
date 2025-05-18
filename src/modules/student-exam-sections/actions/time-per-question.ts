import * as R from 'ramda'
import { flattenQuestions } from '../../../../services/student-exams/flatten-questions'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail } from '../student-exam-section-repository'
import { extractSection } from '../../student-exams/actions/helpers/helpers'
import { stitchArraysByProp } from '../../../../utils/array/stitch-arrays-by-prop'
import { embedKeyAsProp } from '../../../../utils/object/embed-key-as-prop'
import { wrapProps } from '../../../../utils/object/wrap-props'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../student-exams/student-exam-statuses'

const flattenQuestionsWithOriginalQuestion = section => data => {
  const isCompleted = section.exam.status === STUDENT_EXAM_STATUS_COMPLETED

  return flattenQuestions(data, isCompleted, true, true)
}

const findSection = async id => (
  findOneOrFail({
    id,
  }, ['exam.sections.passages.questions.originalQuestion', 'exam.sections.passages.questions.passage'])
)

const filterQuestionsOnly = R.filter(
  R.propEq('resource_type', 'question')
)

const extractQuestionTimers = R.pipe(
  R.path(['exam', 'timers']),
  JSON.parse,
  embedKeyAsProp('original_exam_question_id'),
  filterQuestionsOnly,
  R.map(
    wrapProps('timers', ['reading', 'working', 'checking'])
  )
)

const extractQuestionsForSection = sectionId => section => (
  R.pipe(
    extractSection(sectionId),
    flattenQuestionsWithOriginalQuestion(section),
    R.head,
    R.prop('questions')
  )(section)
)

const transformSection = R.pipe(
  section => stitchArraysByProp(
    'original_exam_question_id',
    extractQuestionsForSection(section.id)(section),
    extractQuestionTimers(section)
  ),
  R.filter(R.prop('id'))
)

export default async (student, sectionId) => {
  const section = await findSection(sectionId)

  R.unless(
    R.pathEq(['exam', 'student_id'], student.id),
    () => throwException(customException('Student ID mismatch', 403))
  )(section)

  return transformSection(section)
}
