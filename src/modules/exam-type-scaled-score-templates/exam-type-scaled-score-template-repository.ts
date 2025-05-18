import { ExamTypeScaledScoreTemplate, ScaledScore } from '../../models'
import { _create } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'
import * as R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = ExamTypeScaledScoreTemplate
const MODEL_NAME = 'ExamTypeScaledScoreTemplate'

export const create = async dto => (
  _create(MODEL)(dto)
)

export const fetchExamTypeTemplatesWithScores = async exam_type_id => R.pipeWith(R.andThen)([
  async () => fetch(MODEL)({ exam_type_id }, ['template.scores'], { limit: {}, order: { by: 'order', dir: 'asc' } }, true),
  R.prop('data'),
  collectionToJson,
])(true)

export const fetchExamTypeTemplates = async exam_type_id => R.pipeWith(R.andThen)([
  async () => fetch(MODEL)({ exam_type_id }, [], undefined, true),
  R.prop('data'),
  collectionToJson,
])(true)
