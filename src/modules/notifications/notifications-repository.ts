import orm, { Notification } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import NotificationDTO from './dto/notification-dto'
import { NotificationType } from './notification-type'
import { POLLING_DELAY_IN_MINUTES } from '../../constants'

const { knex } = orm.bookshelf

const MODEL = Notification
const MODEL_NAME = 'Notification'

export const create = async (dto: NotificationDTO, trx?) => (
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

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const pauseNotification = async (id: string) => {
  await findOneOrFail(function () {
    this.where({ id }).whereRaw('type != ?', [NotificationType.immediate])
  })
  return patch(id, { is_paused: true })
}

export const unpauseNotification = async (id: string) => {
  await findOneOrFail(function () {
    this.where({ id }).whereRaw('type != ?', [NotificationType.immediate])
  })
  return patch(id, { is_paused: false })
}

export const removeOldNotifications = async () => (
  _delete(MODEL)(function () {
    this
      .where('created_at', '<', new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 183))
      .whereRaw('not (type = ? and recurring_definition != \'[]\')', [NotificationType.recurring])
      .whereRaw('not (type = ? and scheduled_for > ?)', [NotificationType.scheduled, new Date(new Date().getTime() + 1000 * 60 * 2 * POLLING_DELAY_IN_MINUTES)])
  })
)

export const getStudentIdsByNotification = async (notification_id: string) => (
  knex('student_notifications')
    .distinct('student_id')
    .where({ notification_id })
    .pluck('student_id')
)
