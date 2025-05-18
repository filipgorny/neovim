import * as R from 'ramda'
import { fixOrderAfterDeleting } from '@desmart/js-utils'
import orm, { CustomEventGroup } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

const { knex } = orm.bookshelf

const MODEL = CustomEventGroup
const MODEL_NAME = 'CustomEventGroup'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
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

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const fixCustomEventGroupOrderAfterDeleting = async (course_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(knex, 'custom_event_groups', 'course_id')(course_id, order)
)

export const getNextOrderByCourseId = async (course_id: string): Promise<number> => {
  const records = await find({ limit: { take: 5000, page: 1 }, order: { by: 'order', dir: 'asc' } }, { course_id })

  return R.pipe(
    R.prop('data'),
    R.length,
    R.inc
  )(records)
}
