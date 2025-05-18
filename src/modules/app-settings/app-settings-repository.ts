import { AppSetting } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete,
  _patchWhere
} from '../../../utils/generics/repository'

const MODEL = AppSetting
const MODEL_NAME = 'AppSetting'

export const create = async (dto: {}) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const patchWhere = async (where: object, data: object) => (
  _patchWhere(MODEL)(where, data)
)

export const patchWhereName = async (name: string, data: object) => (
  patchWhere({ name }, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findByNamespace = async (namespace: string, withRelated = []) => (
  find({ limit: { take: 100 }, order: {} }, {
    namespace,
  }, withRelated)
)

export const findByName = async (name: string) => (
  findOneOrFail({
    name,
  })
)
