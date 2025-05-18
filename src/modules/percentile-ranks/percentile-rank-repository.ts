import { PercentileRank } from '../../models'
import {
  _create,
  _delete,
  _findOne
} from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const MODEL = PercentileRank

export const create = async (dto) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const deleteByExamTypeId = async (exam_type_id: string) => (
  _delete(MODEL)({ exam_type_id })
)
