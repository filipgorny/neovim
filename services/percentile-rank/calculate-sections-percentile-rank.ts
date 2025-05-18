import * as R from 'ramda'
import { findAllCompletedExamsAllStudents } from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { embedKeyAsProp } from '../../utils/object/embed-key-as-prop'
import { percentileRank } from './percentile-rank-from-data-set'
import { fetchExamTypes, ScoreDefinition, countOcurrence, addMissingFrequencies, updatePercentileRankInTheDB } from './calculate-percentile-rank-helpers'

const groupBySectionAmount = R.groupBy(
  R.pipe(
    R.prop('section__amount'),
    R.split('__'),
    R.head,
    (section_number: string) => `section_${section_number}`
  )
)

const addPercentileRank = dataset => {
  const transformed = {}

  R.pipe(
    R.forEachObjIndexed(
      (set, section_number) => {
        const result = R.pipe(
          R.juxt([
            R.map(
              R.pipe(
                R.pick(['value', 'frequency']),
                R.values
              )
            ),
            R.pipe(
              R.pluck('frequency'),
              R.sum
            ),
          ]),
          R.apply(percentileRank)
        )(set)

        // @ts-ignore
        transformed[section_number] = result
      }
    )
  )(dataset)

  return transformed
}

const aggregateScores = (examTypeId: string, question_amount: {}) => (scoreData: ScoreDefinition[]) => (
  R.pipe(
    R.reduce(countOcurrence, {}),
    embedKeyAsProp('section__amount'),
    groupBySectionAmount,
    addMissingFrequencies(question_amount),
    addPercentileRank,
    R.objOf(examTypeId)
  )(scoreData)
)

const pluckAndSum = prop => R.pipe(
  R.pluck(prop),
  R.sum
)

const appendExamSummary = sections => ({
  order: 0,
  title: 'total',
  amount_correct: pluckAndSum('amount_correct')(sections),
  total_amount: pluckAndSum('total_amount')(sections),
})

const extractSectionScoresFromExams = R.pipe(
  R.map(
    R.pipe(
      R.prop('scores'),
      JSON.parse,
      R.prop('sections'),
      (sections: object[]) => R.append(appendExamSummary(sections))(sections)
    )
  ),
  R.flatten
)

const sumExamQuestionAmounnt = R.pipe(
  R.values,
  R.sum
)

export const calculatePercentileRank = async () => {
  const examTypes = await fetchExamTypes()
  const examTypeIdsWithQuestionAmount = R.map(
    R.pipe(
      R.pick(['id', 'question_amount']),
      R.over(
        // @ts-ignore
        R.lensProp('question_amount'),
        R.pipe(
          JSON.parse,
          definition => R.assoc('section_0', sumExamQuestionAmounnt(definition))(definition)
        )
      )
    )
  )(examTypes)

  const results = await mapP(
    async examTypeTuple => R.pipeWith(R.andThen)([
      findAllCompletedExamsAllStudents,
      // R.slice(0, 2), // debug - take only few items (as array)
      extractSectionScoresFromExams,
      aggregateScores(examTypeTuple.id, examTypeTuple.question_amount),
    ])(examTypeTuple)
  )(examTypeIdsWithQuestionAmount)

  await mapP(updatePercentileRankInTheDB)(results)

  return true
}
