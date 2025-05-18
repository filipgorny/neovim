import { ScaledScoreTemplate } from '../../models'
import { _create, _delete, _findOne, _findOneOrFail, _patch } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'
import { findCustom } from '../scaled-scores/scaled-score-repository'

const MODEL = ScaledScoreTemplate
const MODEL_NAME = 'ScaledScoreTemplate'

export const create = async (dto: { title: string }) => (
  _create(MODEL)(dto)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findOne = async (where: object, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecords = async (where: object) => (
  _delete(MODEL)(where)
)

export const fetchMatchingTemplates = async ids => (
  findCustom(
    MODEL.whereIn('id', ids)
  )(undefined, { by: 'title', dir: 'asc' })
)
