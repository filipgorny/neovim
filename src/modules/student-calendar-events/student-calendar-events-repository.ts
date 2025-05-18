import * as R from 'ramda'
import moment from 'moment'
import models, { StudentCalendarEvent } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { CalendarEventStatus } from './calendar-event-status'
import { CalendarEventType } from './calendar-event-type'
import { DATE_FORMAT_YMD } from '../../constants'
import { StudentCourse } from '../../types/student-course'

const MODEL = StudentCalendarEvent
const MODEL_NAME = 'StudentCalendarEvent'

const { knex } = models.bookshelf

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

export const findIncompleteEvents = async (limit: number) => {
  return knex.select('sce.*')
    .from('student_calendar_events as sce')
    .where({
      status: CalendarEventStatus.incomplete,
    })
    .andWhere('event_date', '<', moment().format(DATE_FORMAT_YMD))
    .whereRaw('type not in (\'custom\', \'live_class\', \'custom_live_class\')')
    .orderBy('event_date', 'asc')
    .limit(limit)
}

export const findEventsAfterAvailableToDate = async (studentCourse: StudentCourse) => {
  return knex.select('sce.*')
    .from('student_calendar_events as sce')
    .where('sce.student_course_id', studentCourse.id)
    .andWhere('event_date', '>=', moment(studentCourse.accessible_to).format(DATE_FORMAT_YMD))
}

export const findEventByStudentItemId = async (student_course_id: string, student_item_id: string) => {
  const records = await knex.select('sce.*')
    .from('student_calendar_events as sce')
    .where({
      student_course_id,
      student_item_id,
    })
    .andWhere('type', '!=', CalendarEventType.bookLinkPreReading)

  return R.head(records)
}

export const findEventByStudentExamId = async (student_course_id: string, student_exam_id: string) => {
  const records = await knex.select('sce.*')
    .from('student_calendar_events as sce')
    .where({
      student_course_id,
      student_exam_id,
    })
    .andWhere('type', '!=', CalendarEventType.bookLinkPreReading)

  return R.head(records)
}

export const findEventByStudentItemIdForPreReading = async (student_course_id: string, student_item_id: string) => {
  const records = await knex.select('sce.*')
    .from('student_calendar_events as sce')
    .where({
      student_course_id,
      student_item_id,
      type: CalendarEventType.bookLinkPreReading,
    })

  return R.pipe(
    R.reject(R.propEq('type', CalendarEventType.liveClass)),
    R.head
  )(records)
}

export const findLiveClassEvents = async (student_course_id: string) => {
  return knex.select('sce.*')
    .from('student_calendar_events as sce')
    .where({
      student_course_id,
    })
    .whereIn('type', [CalendarEventType.liveClass, CalendarEventType.customLiveClass])
    .whereNotNull('student_exam_ids')
}
