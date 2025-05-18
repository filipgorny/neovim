import * as R from 'ramda'
import { customException, throwException } from '../../../utils/error/error-factory'
import { findOne, create, patchWhere, findOneOrFail } from './exam-section-score-map-repository'
import { findOne as findExam } from '../exams/exam-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { initializeExamScoreMap } from '../exam-score-map/exam-score-map-service'
import renameProps from '../../../utils/object/rename-props'

const initializeSectionScoreMap = async (exam, section, sectionKey) => {
  const sectionScoreMapElement = await findOne({ section_id: section.id })

  if (sectionScoreMapElement) {
    // scores alreary initialized
    return
  }

  const { type } = exam
  const { score_min, score_max } = section
  const questionsAmounts = JSON.parse(type.question_amount)
  const questions_count = questionsAmounts[sectionKey]

  if (!score_min || !score_max) {
    throwException(customException('exam-section-score-map.section-score-data-invalid', 403, 'Section score data is invalid'))
  }

  if (!questions_count) {
    throwException(customException('exam-section-score-map.section-questions-count-invalid', 403, 'Section questions count is invalid'))
  }

  const questionsStep = questions_count / (score_max - score_min + 1)
  let score = score_min

  for (let i = 0; i <= questions_count; i += 1) {
    score = Math.floor(i / questionsStep) + score_min >= score_max ? score_max : Math.floor(i / questionsStep) + score_min
    const scoreMapElement = {
      exam_id: exam.id,
      section_id: section.id,
      score,
      correct_answers: i,
      amount_correct: 0,
      percentile_rank: 0,
    }

    await create(scoreMapElement)
  }
}

export const initializeScoreMap = async (exam_id: string) => {
  const exam = await findExam({ id: exam_id }, ['type', 'sections'])

  await R.addIndex(mapP)(
    async (section, i) => initializeSectionScoreMap(exam, section, `section_${section.order}`)
  )(exam.sections)

  return initializeExamScoreMap(exam)
}

export const getScaledScoreAndPercentileRankBySectionAndNumberOfCorrectAnswers = async (section_id: string, correct_answers: number) => {
  return R.pipeWith(R.andThen)([
    async () => findOneOrFail({ section_id, correct_answers }),
    R.pick(['score', 'percentile_rank']),
    renameProps({ score: 'scaled_score' }),
  ])(true)
}

export const increaseAmountCorrectForSection = async (item) => {
  const { id, correct_answers } = item

  try {
    const sectionScoreMapElement = await findOne({ section_id: id, correct_answers })

    return patchWhere({ section_id: id, correct_answers }, { amount_correct: sectionScoreMapElement.amount_correct + 1 })
  } catch (e) {
    // if section score map does not exist - do nothing
  }
}
