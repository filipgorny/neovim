import orm, { StudentNotification } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete,
  _patchWhere
} from '../../../utils/generics/repository'
import StudentNotificationDTO from './dto/student-notification-dto'

const { knex } = orm.bookshelf

const MODEL = StudentNotification
const MODEL_NAME = 'StudentNotification'

export const create = async (dto: StudentNotificationDTO, trx?) => (
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

export const patchWhere = async (where: object, data: object, trx?) => (
  _patchWhere(MODEL)(where, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteWhere = async (where: object) => (
  _delete(MODEL)(where)
)

export const removeOldStudentNotifications = async () => (
  _delete(MODEL)(function () {
    this.where('created_at', '<', new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 14))
  })
)

export const countUnseenNotifications = async (student_id: string) => (
  knex.from('student_notifications').where({ student_id, is_seen: false }).count()
)
