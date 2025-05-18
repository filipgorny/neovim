import * as R from 'ramda'
import { findOneOrFail } from '../../student-exam-sections/student-exam-section-repository'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { flattenQuestions, flattenQuestionsCustom } from '../../../../services/student-exams/flatten-questions'
import mapP from '../../../../utils/function/mapp'
import { addToQuestionDifficulty } from '../../exam-questions/exam-question-service'
import { finishSection } from '../../student-exam-sections/student-exam-section-service'
import { extractSection } from './helpers/helpers'
import { calculateWorkingTime } from './finish-section/calculate-working-time'
import { calculatePassageReadingSpeed } from './finish-section/calculate-passage-reading-speed'
import { calculateStudentPassageTimers, calculateStudentQuestionTimers } from '../../../../services/timers/calculate-student-question-timers'
import { findOne as findExam } from '../../student-exams/student-exam-repository'
import { extractPassageTimers, extractQuestionTimers, parseExamTimers } from '../../../../services/timers/timer-utils'
import { updateExamTimersJson } from './finish-section/update-exam-timers-json'

const calculateAmountOfAnsweredQuestions = R.pipe(
  R.juxt([
    R.pipe(
      R.reject(
        R.propSatisfies(R.isNil, 'answer')
      ),
      R.length
    ),
    R.length,
  ]),
  R.apply(R.divide)
)

const calculateQuestionTimes = R.pipe(
  R.pluck('timers'),
  R.map(
    R.pipe(
      R.values,
      R.sum
    )
  ),
  R.sum
)

const calculatePassageTimes = R.pipe(
  R.pluck('passage'),
  R.uniqBy(R.prop('id')),
  R.map(
    R.pipe(
      R.pick(['checking', 'working', 'reading']),
      R.values,
      R.sum
    )
  ),
  R.sum
)

const calculateTimeSpentInSection = R.pipe(
  R.juxt([
    calculateQuestionTimes,
    calculatePassageTimes,
  ]),
  R.sum
)

export default async (student, examId, sectionId) => {
  const section = await findOneOrFail({
    id: sectionId,
    student_exam_id: examId,
  }, ['passages.questions.originalQuestion', 'passages.originalPassage'])

  R.unless(
    R.propEq('id', student.id),
    () => throwException(customException('Student ID mismatch', 404))
  )(student)

  if (section.is_finished) {
    return section
  }

  const fullExam = await findExam({
    id: examId,
  }, ['originalExam', 'sections.passages.questions.originalQuestion'])

  const flatSections = flattenQuestionsCustom({
    sections: [section],
    exam_length: fullExam.exam_length,
  }, {
    withOriginalQuestions: true,
  })

  const questionsForTimers = R.pipe(
    R.pluck('questions'),
    R.flatten
  )(flatSections)

  const passagesForTimers = R.pipe(
    R.pluck('passages'),
    R.flatten
  )(flatSections)

  const timers = parseExamTimers(fullExam)
  const questionTimers = extractQuestionTimers(timers)
  const passageTimers = extractPassageTimers(timers)

  // for debugging purposes
  await finishSection(sectionId)

  await calculateStudentQuestionTimers(questionsForTimers, questionTimers)
  await calculateStudentPassageTimers(passagesForTimers, passageTimers)

  const sectionForReadingSpeed = await findOneOrFail({
    id: sectionId,
    student_exam_id: examId,
  }, ['exam.sections.passages.questions', 'passages.originalPassage'])

  await calculatePassageReadingSpeed(sectionForReadingSpeed)

  const questions = R.pipe(
    extractSection(sectionId),
    exam => flattenQuestions(exam, true),
    R.head,
    R.prop('questions')
  )({ exam: fullExam })

  const currentSection = await findOneOrFail({
    id: sectionId,
    student_exam_id: examId,
  }, ['passages.questions.passage', 'exam'])

  await calculateWorkingTime(currentSection)
  await updateExamTimersJson(sectionId)

  if (section.is_intact && fullExam.completions_done === 0) {
    return mapP(addToQuestionDifficulty)(questions)
  }
  return section
}
