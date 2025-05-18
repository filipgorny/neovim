import models, { StudentExamCompletion } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentCourseDTO } from '../../types/student-course'

const MODEL = StudentExamCompletion
const MODEL_NAME = 'StudentExamCompletion'

const { knex } = models.bookshelf

export const create = async (dto: {}) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated?: string[]) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: Partial<StudentCourseDTO>) => (
  _patch(MODEL)(id, data)
)

export const removeSoftly = async (id: string) => (
  patch(id, { is_deleted: true })
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const getCompletionsForStudentExam = async (student_exam_id: string) => (
  knex.select('sec.*')
    .from('student_exam_completions as sec')
    .where({ student_exam_id })
    .orderBy('completed_at', 'desc')
)
