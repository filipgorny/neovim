import { ScaledScore } from '../../models'
import { _create, _delete, _findOne } from '../../../utils/generics/repository'
import { fetchCustom } from '../../../utils/model/fetch'
import * as R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = ScaledScore
const MODEL_NAME = 'ScaledScore'

export const create = template_id => async (payload) => (
  _create(MODEL)({
    ...payload,
    template_id,
  })
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const deleteRecords = async (where: object) => (
  _delete(MODEL)(where)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order }, true)
)

const fetchMatchingScaledScores = async ids => (
  findCustom(
    MODEL.whereIn('template_id', ids)
  )(undefined, { by: 'scaled_score', dir: 'desc' })
)

export const findScaledScores = async ids => (
  R.pipeWith(R.andThen)([
    fetchMatchingScaledScores,
    R.prop('data'),
    collectionToJson,
    // @ts-ignore
    R.groupBy(R.prop('template_id')),
  ])(ids)
)
