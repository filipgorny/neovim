import orm, { StudentFlashcardArchive } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

const { knex } = orm.bookshelf

const MODEL = StudentFlashcardArchive
const MODEL_NAME = 'StudentFlashcardArchive'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)({
    ...dto,
  }, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const findAllByStudentCourseId = async (student_course_id: string) => (
  MODEL.where({ student_course_id }).fetchAll()
)

export const find = async (query: { limit: { take: number, page: number }, order: {} }, where = {}, withRelated = []) => (
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

export const deleteByStudentFlashcardId = async (student_flashcard_id: string) => (
  _delete(MODEL)({ student_flashcard_id })
)
