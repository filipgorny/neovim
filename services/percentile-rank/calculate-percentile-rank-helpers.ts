import * as R from 'ramda'
import { find as findExamTypes } from '../../src/modules/exam-types/exam-type-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { applySpecOrEvolve } from '../../utils/object/apply-spec-or-evolve'
import renameProps from '../../utils/object/rename-props'
import { createPercentileRank, dropPercentileRanks } from '../../src/modules/percentile-ranks/percentile-rank-service'
import mapP from '../../utils/function/mapp'

export type ScoreDefinition = {
  amount_correct: number,
  order: number
}

type PercentileRankRecord = {
  percentile_rank: number,
  value: number
}

export const fetchExamTypes = async () => (
  R.pipeWith(R.andThen)([
    async () => findExamTypes({ limit: {}, order: {} }, { score_calculations_enabled: true }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const increaseOrOne = R.ifElse(
  R.isNil,
  R.always(1),
  R.inc
)

const buildKeyFromScoreDefinition = (scoreDefinition: ScoreDefinition): string => (
  `${scoreDefinition.order}__${scoreDefinition.amount_correct}`
)

export const countOcurrence = (acc: {}, scoreDefinition: ScoreDefinition) => (
  R.over(
    R.lensProp(
      // @ts-ignore
      buildKeyFromScoreDefinition(scoreDefinition)
    ),
    applySpecOrEvolve({
      frequency: increaseOrOne,
    })
  )(acc)
)

const convertSectionAmountToValue = R.pipe(
  // @ts-ignore
  R.map(
    // @ts-ignore
    R.over(
      // @ts-ignore
      R.lensProp('section__amount'),
      // @ts-ignore
      R.pipe(
        R.split('__'),
        R.last,
        parseInt
      )
    )
  ),
  R.map(
    renameProps({
      section__amount: 'value',
    })
  )
)

export const addMissingFrequencies = question_amount => dataset => {
  const transformed = {}

  const result = R.pipe(
    R.forEachObjIndexed(
      (set, section_number) => {
        const missingItems = []
        // @ts-ignore
        const convertedSet = convertSectionAmountToValue(set)

        for (let i = 0; i <= question_amount[section_number]; i++) {
          const item = R.find(
            R.propEq('value', i)
          )(convertedSet)

          if (!item) {
            missingItems.push({
              value: i,
              frequency: 0,
            })
          }
        }

        // @ts-ignore
        transformed[section_number] = R.concat(convertedSet)(missingItems)
      }
    )
  )(dataset)

  return transformed
}

const orderFromSection = R.pipe(
  R.split('_'),
  R.last,
  parseInt
)

const savePercenntileRanks = examTypeId => async ([section_order, records]) => {
  const order = orderFromSection(section_order)

  return mapP(
    async (pr: PercentileRankRecord) => (
      createPercentileRank(examTypeId, order, pr.value, pr.percentile_rank)
    )
  )(records)
}

export const updatePercentileRankInTheDB = async results => {
  const examTypeId = R.pipe(
    R.keys,
    R.head
  )(results)

  const percentileRankBySection = R.pipe(
    R.values,
    R.head,
    R.toPairs
  )(results)

  await dropPercentileRanks(examTypeId)
  await mapP(
    savePercenntileRanks(examTypeId)
  )(percentileRankBySection)
}
