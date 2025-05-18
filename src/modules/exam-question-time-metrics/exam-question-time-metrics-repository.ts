import { ExamQuestionTimeMetrics } from '../../models'
import { _create, _findOne, _patch } from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const MODEL = ExamQuestionTimeMetrics

export const create = async (dto) => (
  _create(MODEL)(dto)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = [], disablePagination = false) => (
  fetch(MODEL)(where, withRelated, query, disablePagination)
)
