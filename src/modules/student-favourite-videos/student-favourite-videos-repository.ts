import * as R from 'ramda'
import orm, { StudentFavouriteVideo } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentFavouriteVideoDTO } from '../../types/student-favourite-video'
import { int } from '@desmart/js-utils'

const { knex } = orm.bookshelf

const MODEL = StudentFavouriteVideo
const MODEL_NAME = 'StudentFavouriteVideo'

export const create = async (dto: StudentFavouriteVideoDTO, trx?) => (
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

export const findAllByStudentId = async (student_id: string, course_id: string, withRelated = []) => (
  fetch(MODEL)({ student_id, course_id }, withRelated, { limit: {}, order: { by: 'created_at', dir: 'desc' } }, true)
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

export const deleteWhere = async (where: object) => (
  _delete(MODEL)(where)
)

export const countFavouriteVideos = async (student_id: string, course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => knex
      .from({ sfv: 'student_favourite_videos' })
      .where({ student_id, course_id })
      .countDistinct('sfv.id'),
    R.head,
  ])(true)
)
