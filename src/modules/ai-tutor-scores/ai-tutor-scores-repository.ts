import models, { AiTutorScore } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

const { knex } = models.bookshelf

const MODEL = AiTutorScore
const MODEL_NAME = 'AiTutorScore'

export const create = async (dto: {}, trx?) => (
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

export const findAverageScoresByChapter = async (studentCourseId: string) => {
  return MODEL.query(qb => {
    qb.select('student_book_chapter_id')
      .select(knex.raw('ROUND(AVG(score)) as average_score'))
      .where('student_course_id', studentCourseId)
      .groupBy('student_book_chapter_id')
      .orderBy('student_book_chapter_id')
  })
    .fetchAll({
      withRelated: [{
        chapter: (qb) => {
          qb.select('id', 'title', 'order')
        },
      }],
    })
}

export const findAverageScoresByChapterWithBookInfo = async (studentCourseId: string) => {
  return knex
    .select([
      'sbc.id',
      'sbc.order',
      'sbc.title',
      knex.raw('ROUND(AVG(ats.score)) as average_score'),
      'sb.id as student_book_id',
      'sb.tag',
      'sb.tag_colour',
      'sb.title as book_title',
      'sb.book_id as original_book_id',
      'sb.last_chapter',
      'sb.last_part',
      'sb.last_student_book_subchapter_id_seen',
    ])
    .from('student_book_chapters as sbc')
    .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
    .leftJoin('books as b', 'b.id', 'sb.book_id')
    .leftJoin('ai_tutor_scores as ats', 'ats.student_book_chapter_id', 'sbc.id')
    .where('sb.course_id', studentCourseId)
    .andWhere('b.ai_tutor_enabled', true)
    .andWhereNot(knex.raw('LOWER(sb.tag) LIKE ?', ['%cars%']))
    .groupBy(['sbc.id', 'sb.id'])
    .orderBy('sbc.order')
}
