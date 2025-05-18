import { ExamPassageMetricsAvg } from '../../models'
import { fetch } from '../../../utils/model/fetch'
import { _findOne, _patch, _create, _deleteAll } from '../../../utils/generics/repository'

const MODEL = ExamPassageMetricsAvg

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const create = async (exam_type_id: string, payload: object) => (
  _create(MODEL)({
    exam_type_id,
    ...payload
  })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteAll = async (ids: string[]) => (
  _deleteAll(MODEL)(ids)
)
