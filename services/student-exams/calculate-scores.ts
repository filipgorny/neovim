import * as R from 'ramda'
import { flattenQuestions } from './flatten-questions'
import { findOne as findOnePercentile } from '../../src/modules/percentile-ranks/percentile-rank-repository'
import asAsync from '../../utils/function/as-async'
import { ScoreCalculationMethod } from '../../src/modules/exams/score-calculation-methods'
import { calculateManufacturedScores } from './calculate-scores-helpers/calculate-manufactured-scores'
import { calculateNormalScores } from './calculate-scores-helpers/calculate-normal-scores'
import { getScaledScoreAndPercentileRankBySectionAndNumberOfCorrectAnswers } from '../../src/modules/exam-section-score-map/exam-section-score-map-service'
import { getPercentileRankByExamIdAndScore } from '../../src/modules/exam-score-map/exam-score-map-service'
import { findOneOrFail as findStudentExamSection } from '../../src/modules/student-exam-sections/student-exam-section-repository'

type Question = {
  answer: string,
  correct_answer: string
}

type SectionScore = {
  id: string
  title: string
  order: number
  amount_correct: number
  total_amount: number
  percentage_correct: string
}

const correctAnswer = (question: Question): boolean => question.answer === question.correct_answer
const filterOnlyCorrectAnswers = correctAnswer => (data: Question[]): Question[] => R.filter(correctAnswer)(data)

const countCorrectAnswersInSection = R.pipe(
  filterOnlyCorrectAnswers(correctAnswer),
  R.length
)

const aggregateQuestions = R.applySpec({
  amount_correct: countCorrectAnswersInSection,
  total_amount: R.length,
})

const roundToSecondDecimalPoint = R.pipe(
  R.multiply(100),
  Math.round,
  R.divide(R.__, 100)
)

const calculatePercentageOfCorrectAnswers = questions => (
  R.pipe(
    R.pick(['amount_correct', 'total_amount']),
    R.values,
    R.apply(R.divide),
    R.multiply(100),
    roundToSecondDecimalPoint,
    R.objOf('percentage_correct')
  )(questions)
)

const calculateScoresForSection = questions => {
  const correctQuestions = aggregateQuestions(questions)
  const percentageValue = calculatePercentageOfCorrectAnswers(correctQuestions)

  return {
    ...correctQuestions,
    ...percentageValue,
  }
}

const calculateScaledScoreForSection = (examTypeId, exam) => async (sectionScore) => (
  shouldCalculateManufacturedScores(exam)
    ? calculateManufacturedScores(sectionScore, exam)
    : calculateNormalScores(sectionScore, examTypeId)
)

const pluckAndSumProp = prop => R.pipe(
  R.pluck(prop),
  R.sum
)

const getExamPercentileRank = async (exam_type_id, correct_answer_amount) => (
  findOnePercentile({
    exam_type_id,
    section_order: 0,
    correct_answer_amount,
  })
)

const findExamScoreByScaledScore = async (scaledScore, exam) => (
  R.pipe(
    R.path(['originalExam', 'scores']),
    R.find(
      R.propEq('score', scaledScore)
    )
  )(exam)
)

const calculateExamPercentileRank = (examTypeId, exam) => async scores => {
  const sections = scores.sections
  const scaledScore = pluckAndSumProp('scaled_score')(sections)
  const amountCorrect = pluckAndSumProp('amount_correct')(sections)

  const percentileRank = shouldCalculateManufacturedScores(exam)
    ? await findExamScoreByScaledScore(scaledScore, exam)
    : await getExamPercentileRank(examTypeId, amountCorrect)

  return {
    exam: {
      scaled_score: scaledScore,
      amount_correct: amountCorrect,
      percentile_rank: percentileRank.percentile_rank,
    },
    sections,
  }
}

const calculateScaledScore = (examTypeId, exam) => async (scores: SectionScore[]) => {
  const fullSectionScores = []

  for (let i = 0; i < scores.length; i++) {
    const sectionScore = scores[i]
    const calculated = await calculateScaledScoreForSection(examTypeId, exam)(sectionScore)

    fullSectionScores.push(calculated)
  }

  const scaledScore = pluckAndSumProp('scaled_score')(fullSectionScores)
  const amountCorrect = pluckAndSumProp('amount_correct')(fullSectionScores)

  const percentileRank = shouldCalculateManufacturedScores(exam)
    ? await findExamScoreByScaledScore(scaledScore, exam)
    : await getExamPercentileRank(examTypeId, amountCorrect)

  return {
    exam: {
      scaled_score: scaledScore,
      amount_correct: amountCorrect,
      percentile_rank: percentileRank.percentile_rank,
    },
    sections: fullSectionScores,
  }
}

const retrieveScaledScore = (exam) => async (scores: SectionScore[]) => {
  const fullSectionScores = []

  for (let i = 0; i < scores.length; i++) {
    const sectionScore = scores[i]

    const studentExamSection = await findStudentExamSection({ id: sectionScore.id }, ['exam.originalExam.sections'])
    const examSection = studentExamSection.exam.originalExam.sections.find(s => s.order === studentExamSection.order)

    const retrievedScaledScoreAndPercentileRank = await getScaledScoreAndPercentileRankBySectionAndNumberOfCorrectAnswers(examSection.id, sectionScore.amount_correct)

    fullSectionScores.push({
      ...sectionScore,
      ...retrievedScaledScoreAndPercentileRank,
    })
  }

  const scaledScore = pluckAndSumProp('scaled_score')(fullSectionScores)
  const amountCorrect = pluckAndSumProp('amount_correct')(fullSectionScores)
  const percentileRank = await getPercentileRankByExamIdAndScore(exam.exam_id, scaledScore)

  return {
    exam: {
      scaled_score: scaledScore,
      amount_correct: amountCorrect,
      percentile_rank: percentileRank,
    },
    sections: fullSectionScores,
  }
}

const calculateSectionScores = (questions): SectionScore[] => R.map(
  R.pipe(
    R.juxt([
      R.pick(['id', 'title', 'order']),
      R.pipe(
        R.prop('questions'),
        calculateScoresForSection
      ),
    ]),
    R.mergeAll
  )
)(questions)

const shouldCalculateManufacturedScores = R.pathSatisfies(
  R.equals(ScoreCalculationMethod.manufactured),
  ['originalExam', 'score_calculation_method']
)

const handleManufacturedScores = exam => R.pipe(
  calculateSectionScores,
  calculateScaledScore(exam.exam_type_id, exam)
)

const handleScaledScores = exam => R.pipeWith(R.andThen)([
  asAsync(calculateSectionScores),
  retrieveScaledScore(exam),
])

export const calculateScores = async (exam, scoreCalculationsEnabled): Promise<{}> => {
  const questions = flattenQuestions(exam, true)

  return handleScaledScores(exam)(questions)
}
