import orm, { SaltyBucksLog } from '../../models'
import { fetch, fetchCustom, fetchRaw, Order, Pagination, StringLimit } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { Knex } from 'knex'
import * as R from 'ramda'
import { SaltyBucksOperationType } from './salty-bucks-operation-type'
import { SaltyBucksOperationSubtype } from './salty-bucks-operation-subtype'
import { SaltyBucksReferenceType } from './salty-bucks-reference-type'

const { knex } = orm.bookshelf

interface FindSaltyBucksLogsCommand {
  studentId: string
  limit?: Partial<StringLimit>
  order?: Partial<Order>
}

const MODEL = SaltyBucksLog
const MODEL_NAME = 'SaltyBucksLog'

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

export const find = async (query: {limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

const findSaltyBucksLogsCountResults = ({ knex, studentId }: { knex: Knex, studentId: string }) => {
  return knex
    .from({ sbl: 'salty_bucks_logs' })
    .where({ 'sbl.student_id': studentId })
    .countDistinct('sbl.id')
}

const findSaltyBucksLogsBuildQuery = (command: { studentId: string }) => async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
  if (count) {
    const count = await findSaltyBucksLogsCountResults({ knex, studentId: command.studentId })

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  let qb = knex
    .select('sbl.*')
    .from({ sbl: 'salty_bucks_logs' })
    .where({ 'sbl.student_id': command.studentId })
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  if (order?.by) {
    qb = qb.orderByRaw(`${order.by} ${order.dir ?? 'asc'} NULLS LAST`)
  }

  return qb
}

export const findSaltyBucksLogs = async (command: FindSaltyBucksLogsCommand) => (
  fetchRaw(
    MODEL,
    findSaltyBucksLogsBuildQuery(command)
  )(command)
)

export const fetchForSaltyBucksEarnings = async (studentId: string) => (
  knex('salty_bucks_logs')
    .select(
      knex.raw('to_char(created_at, \'YYYY-MM-DD\') as "day"'),
      knex.raw(`sum(amount) filter (where operation_type = '${SaltyBucksOperationType.income}') as income`),
      knex.raw(`sum(amount) filter (where operation_type = '${SaltyBucksOperationType.outcome}') as outcome`)
    ).where({ student_id: studentId })
    .groupBy('day')
    .orderBy('day', 'asc')
)

const buildSaltyBuckLogsQueryBySubtype = (studentId: string, olderThanDate: string) => (subtypes: string[]) => (
  knex
    .select('sbl.*')
    .from({ sbl: 'salty_bucks_logs' })
    .where({ 'sbl.student_id': studentId })
    .andWhere('created_at', '>=', olderThanDate)
    .andWhereRaw(`sbl.operation_subtype in ('${subtypes.join('\', \'')}')`)
)

const findSaltyBucksLogsForFlashcardsBuildQuery = (studentId: string, olderThanDate: string) => async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
  if (count) {
    return [0]
  }

  return buildSaltyBuckLogsQueryBySubtype(studentId, olderThanDate)([
    SaltyBucksOperationSubtype.flashcardIncreasePLevel,
    SaltyBucksOperationSubtype.flashcardResetPLevel,
  ])
}

export const findSaltyBucksLogsForFlashcards = async (studentId: string, olderThanDate: string) => (
  fetchRaw(
    MODEL,
    findSaltyBucksLogsForFlashcardsBuildQuery(studentId, olderThanDate)
  )({ limit: {}, order: {} })
)

const findSaltyBucksLogsForContentQuestionsBuildQuery = (studentId: string, olderThanDate: string) => async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
  if (count) {
    return [0]
  }

  return buildSaltyBuckLogsQueryBySubtype(studentId, olderThanDate)([
    SaltyBucksOperationSubtype.correctAnswerContentQuestion,
    SaltyBucksOperationSubtype.answerContentQuestion,
  ])
}

export const findSaltyBucksLogsForContentQuestions = async (studentId: string, olderThanDate: string) => (
  fetchRaw(
    MODEL,
    findSaltyBucksLogsForContentQuestionsBuildQuery(studentId, olderThanDate)
  )({ limit: {}, order: {} })
)

const findSaltyBucksLogsForReadingBooksBuildQuery = (studentId: string, olderThanDate: string) => async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
  if (count) {
    return [0]
  }

  return buildSaltyBuckLogsQueryBySubtype(studentId, olderThanDate)([
    SaltyBucksOperationSubtype.activeOnSite_2min,
    SaltyBucksOperationSubtype.activeOnSite_30min,
  ])
}

export const findSaltyBucksLogsForReadingBooks = async (studentId: string, olderThanDate: string) => (
  fetchRaw(
    MODEL,
    findSaltyBucksLogsForReadingBooksBuildQuery(studentId, olderThanDate)
  )({ limit: {}, order: {} })
)

const findSaltyBucksLogsForWatchingVideosBuildQuery = (studentId: string, olderThanDate: string) => async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
  if (count) {
    return [0]
  }

  return buildSaltyBuckLogsQueryBySubtype(studentId, olderThanDate)([
    SaltyBucksOperationSubtype.watchAllVideosInBook,
    SaltyBucksOperationSubtype.watchAllVideosInChapter,
    SaltyBucksOperationSubtype.watchNewVideo,
  ])
}

export const findSaltyBucksLogsForWatchingVideos = async (studentId: string, olderThanDate: string) => (
  fetchRaw(
    MODEL,
    findSaltyBucksLogsForWatchingVideosBuildQuery(studentId, olderThanDate)
  )({ limit: {}, order: {} })
)

export const findLastSiteActivity = async (student_id: string) => {
  return find({ order: { by: 'created_at', dir: 'desc' }, limit: { page: 1, take: 1 } }, { student_id, reference_type: SaltyBucksReferenceType.siteActivity })
}
