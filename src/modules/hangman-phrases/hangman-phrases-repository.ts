import { HangmanPhrase } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete,
  _findOneWithoutDeleted,
  _findOneOrFailWithoutDeleted
} from '../../../utils/generics/repository'
import { DELETED_AT } from '@desmart/js-utils'

const MODEL = HangmanPhrase
const MODEL_NAME = 'HangmanPhrase'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOneWithoutDeleted = async (where: {}) => (
  _findOneWithoutDeleted(MODEL)(where)
)

export const findOneOrFailWithoutDeleted = async (where: object, withRelated = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, filter: { search?: string } = {}, withRelated = []) => (
  fetch(MODEL)(function () {
    const { search = '', ...where } = filter
    this
      .where(where)
      .whereNull(DELETED_AT)
      .where('phrase_raw', 'ilike', `%${search}%`)
  }, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)
