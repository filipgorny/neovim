import * as R from 'ramda'
import { customException, throwException } from '@desmart/js-utils'
import { findOneOrFail as findSection } from '../../exam-sections/exam-section-repository'
import { find as findSectionScoreMap, patch } from '../exam-section-score-map-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import mapP from '@desmart/js-utils/dist/function/mapp'

type Payload = {
  score_map: number[]
}

const validateSetIsGrowingOrSame = data => {
  R.addIndex(R.forEach)(
    (value, i) => {
      const previousValue = data[i - 1] || -Infinity

      if (value < previousValue) {
        throwException(customException('exam-section-score-map.set-must-be-growing-or-same', 422, 'Score map must be growing or stay the same'))
      }
    }
  )(data)
}

const validateFirstValueIsEqualToScoreMin = (data, score_min) => {
  if (data[0] !== score_min) {
    throwException(customException('exam-section-score-map.first-value-must-be-equal-to-score-min', 422, `First value must be equal to score min (${score_min}), got ${data[0]}`))
  }
}

const validateLastValueIsEqualToScoreMax = (data, score_max) => {
  const lastValue = R.last(data)

  if (lastValue !== score_max) {
    throwException(customException('exam-section-score-map.first-value-must-be-equal-to-score-min', 422, `Last value must be equal to score max (${score_max}), got ${lastValue}`))
  }
}

const getScoreMap = async (section_id: string) => (
  R.pipeWith(R.andThen)([
    async section_id => findSectionScoreMap({ limit: { take: 1000, page: 1 }, order: { by: 'correct_answers', dir: 'asc' } }, { section_id }),
    R.prop('data'),
    collectionToJson,
  ])(section_id)
)

const validatePayloadLength = (payload, scoreMap) => {
  if (payload.score_map.length !== scoreMap.length) {
    throwException(customException('exam-section-score-map.payload-length-must-be-equal-to-score-map-length', 422, `Payload length must be equal to score map length (${scoreMap.length}), got ${payload.score_map.length}`))
  }
}

export default async (section_id: string, payload: Payload) => {
  const [section, scoreMap] = await Promise.all([
    findSection({ id: section_id }),
    getScoreMap(section_id),
  ])

  validateSetIsGrowingOrSame(payload.score_map)
  validateFirstValueIsEqualToScoreMin(payload.score_map, section.score_min)
  validateLastValueIsEqualToScoreMax(payload.score_map, section.score_max)
  validatePayloadLength(payload, scoreMap)

  return R.addIndex(mapP)(
    async (scoreMapItem, i) => (
      patch(scoreMapItem.id, {
        score: payload.score_map[i],
      })
    )
  )(scoreMap)
}
