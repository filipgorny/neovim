import * as R from 'ramda'
import { CourseMap } from '../../models'
import { fetch, fetchCustom, fetchRaw, StringLimit, Order, Pagination } from '../../../utils/model/fetch'
import { Knex } from 'knex'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

interface FindCourseMapForStudentCommand {
  studentId: string
  courseId: string
  limit?: Partial<StringLimit>
  order?: Partial<Order>
}

const MODEL = CourseMap
const MODEL_NAME = 'CourseMap'

export const create = async (dto: {}) => (
  _create(MODEL)(dto)
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

const findAvailableCourseMapForStudentBuildQuery = (command: { studentId: string, courseId: string}) => async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
  const takenCoursesIdsSQL = knex
    .select('cm.id')
    .from({ cm: 'course_map' })
    .leftJoin('student_courses as sc', 'cm.book_course_id', 'sc.book_course_id')
    .whereRaw(`cm.book_course_id = '${command.courseId}'`)
    .whereRaw(`sc.student_id = '${command.studentId}'`)
    .whereRaw('cm.title = sc.subtitle')
    .toSQL().sql

  let qb = knex
    .select('*')
    .from({ cm: 'course_map' })
    .where({ 'cm.book_course_id': command.courseId })
    .whereRaw(`id not in (${takenCoursesIdsSQL})`)
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  if (order?.by) {
    qb = qb.orderByRaw(`${order.by} ${order.dir ?? 'asc'} NULLS LAST`)
  }

  return qb
}

export const findAvailableForStudent = async (command: FindCourseMapForStudentCommand) => (
  fetchRaw(
    MODEL,
    findAvailableCourseMapForStudentBuildQuery(command)
  )(command)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteByCourseId = async (book_course_id: string) => (
  _delete(MODEL)({ book_course_id })
)

export const findCourseByExternalId = async (external_id: string) => {
  const course = await find({
    limit: { page: 1, take: 1 },
    order: { by: 'book_course_id', dir: 'desc' },
  }, { external_id }, [
    'course',
  ])

  return R.pipe(
    R.prop('data'),
    R.invoker(0, 'toJSON'),
    R.head
  )(course)
}
