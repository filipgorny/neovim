import * as R from 'ramda'
import orm, { CourseEndDate } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { findOneOrFail as findCourseOrFail } from '../courses/course-repository'

const { knex } = orm.bookshelf

const MODEL = CourseEndDate
const MODEL_NAME = 'CourseEndDate'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
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

export const deleteByCourseId = async (course_id: string) => (
  _delete(MODEL)({ course_id })
)

const rejectPastYears = (data) => {
  const currentYear = (new Date()).getFullYear()

  return R.reject(
    year => year < currentYear
  )(data)
}

export const getPossibleYears = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findCourseOrFail({ id: course_id }),
    async () => knex.select(knex.raw('EXTRACT(YEAR FROM end_date) as year')).from('course_end_dates').where({ course_id }).groupBy('year').orderBy('year', 'asc'),
    R.pluck('year'),
    rejectPastYears,
  ])(true)
)

export const findEndDatesByStudentId = async (student_id: string) => (
  knex.select('ced.*', 'sc.title').from('course_end_dates AS ced')
    .leftJoin('student_courses AS sc', 'sc.book_course_id', 'ced.course_id')
    .where('sc.student_id', student_id)
)
