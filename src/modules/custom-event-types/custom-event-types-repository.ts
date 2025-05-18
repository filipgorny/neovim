import * as R from 'ramda'
import orm, { CustomEventType } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { fixOrderAfterDeleting } from '@desmart/js-utils'

const { knex } = orm.bookshelf

const MODEL = CustomEventType
const MODEL_NAME = 'CustomEventType'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
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

export const fixCustomEventTypeOrderAfterDeleting = async (custom_event_group_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(knex, 'custom_event_types', 'custom_event_group_id')(custom_event_group_id, order)
)

export const getNextOrderByGroupId = async (custom_event_group_id: string): Promise<number> => {
  const records = await find({ limit: { take: 5000, page: 1 }, order: { by: 'order', dir: 'asc' } }, { custom_event_group_id })

  return R.pipe(
    R.prop('data'),
    R.length,
    R.inc
  )(records)
}
