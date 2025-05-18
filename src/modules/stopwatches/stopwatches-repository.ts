import orm, { Stopwatch } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import R from 'ramda'
import { StopwatchState } from './stopwatch-state'

const { knex } = orm.bookshelf

const MODEL = Stopwatch
const MODEL_NAME = 'Stopwatch'

interface BaseCommand {
  studentCourseId: string
  studentId: string
  date: string | Date
}

type IncrementStopwatchCommand = BaseCommand & { seconds: number }

type PatchCommand = BaseCommand & { data: any }

type UpdateStateCommand = BaseCommand & { state: StopwatchState }

export const create = async (dto: {}) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (command: PatchCommand) => {
  const result = await knex('stopwatches')
    .where({
      date: command.date,
      student_course_id: command.studentCourseId,
      student_id: command.studentId,
    })
    .update(command.data, '*')

  return R.head(result)
}

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteByStudentCourseId = async (student_course_id: string) => (
  _delete(MODEL)({ student_course_id })
)

export const incrementStopwatch = async (command: IncrementStopwatchCommand) => {
  const result = await knex('stopwatches')
    .insert({
      student_course_id: command.studentCourseId,
      student_id: command.studentId,
      date: command.date,
      seconds: command.seconds,
      state: StopwatchState.Started,
    })
    .onConflict(['student_course_id', 'student_id', 'date'])
    .merge({
      seconds: knex.raw('stopwatches.seconds + ?', command.seconds),
    })
    .returning('*')

  return R.head(result)
}

export const upsertState = async (command: UpdateStateCommand) => {
  const result = await knex('stopwatches')
    .insert({
      student_course_id: command.studentCourseId,
      student_id: command.studentId,
      date: command.date,
      state: command.state,
      seconds: 0,
    })
    .onConflict(['student_course_id', 'student_id', 'date'])
    .merge({ state: command.state })
    .returning('*')

  return R.head(result)
}

export const getLatest = async (command: { studentCourseId: string, studentId: string}) => {
  return await knex('stopwatches')
    .where({ student_course_id: command.studentCourseId, student_id: command.studentId })
    .orderBy('date', 'desc')
    .limit(1)
    .first()
}

export const sumSeconds = async (command: { studentCourseId: string, studentId: string}) => {
  const result = await knex('stopwatches')
    .select(knex.raw('coalesce(sum(seconds), 0) as sum'))
    .where({ student_course_id: command.studentCourseId, student_id: command.studentId })
    .first() as any

  return parseInt(result?.sum, 10)
}

export const fetchForStudyTime = async (student_course_id: string, student_id: string, dateFrom: string) => (
  knex('stopwatches')
    .select('*')
    .where({ student_course_id, student_id })
    .andWhere('date', '>', dateFrom)
    .orderBy('date', 'desc')
)
