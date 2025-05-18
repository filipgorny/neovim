import * as R from 'ramda'
import { OrganizationAdmin } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { DELETED_AT } from '@desmart/js-utils'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = OrganizationAdmin
const MODEL_NAME = 'OrganizationAdmin'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  }, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = [], disablePagination = false, fetchConfig = {}) => (
  fetchCustom(qb)(withRelated, { limit, order }, disablePagination, fetchConfig)
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findOneByEmail = async (email: string, fetchConfig = {}) => R.pipeWith(R.andThen)([
  async () => findCustom(
    MODEL
      .whereRaw('(email ilike ?)', email)
      .whereNull(DELETED_AT)
  )({ take: 1, page: 1 }, { by: 'email', dir: 'asc' }, [], false, fetchConfig),
  R.prop('data'),
  collectionToJson,
  R.ifElse(
    R.isEmpty,
    R.always(undefined),
    R.head
  ),
])(true)
