import * as R from 'ramda'
import { BookContentQuestionDTO } from './dto/book-content-question-dto'
import models, { BookContentQuestion } from '../../models'
import { fetch } from '../../../utils/model/fetch'
import {
  _create,
  _findOneOrFail,
  _findOne,
  _patch,
  _delete,
  fixOrderAfterDeleting,
  fixOrderAfterAdding,
  _patchRaw
} from '../../../utils/generics/repository'
import { NewBookContentQuestion } from '../../types/book-conntent-question'

const { knex } = models.bookshelf

const MODEL = BookContentQuestion
const MODEL_NAME = 'BookContentQuestion'

export const create = async (dto: BookContentQuestionDTO) => (
  _create(MODEL)({
    ...dto,
  })
)
export const patch = async (id: string, data: Partial<BookContentQuestionDTO>, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const update = async (id: string, data: {}, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOne = async (where: {}, withRelated?: string[]) => (
  _findOne(MODEL)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
  }, withRelated, query)
)

export const fixQuestionOrderAfterDeleting = async (subchapter_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterDeleting(knex, 'book_content_questions', 'subchapter_id', trx, 'subchapter_order')(subchapter_id, order)
)

export const fixQuestionOrderAfterAdding = async (content_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterAdding(knex, 'book_content_questions', 'content_id', trx, 'subchapter_order')(content_id, order)
)

export const remove = async id => (
  _delete(MODEL)({ id })
)

export const removeWhere = async where => (
  _delete(MODEL)(where)
)

export const upsertQuestions = async (questions: NewBookContentQuestion[]) => (
  knex('book_content_questions')
    .insert(questions)
    .returning('*')
)

export const reorderQuestions = async (questions: Array<{order: number, id: string}>) => (
  knex.transaction(
    _patchRaw(knex, 'book_content_questions')(questions)
  )
)

// TODO: add conditions on removed book contents or questions
// export const findOneBySubchapterId = async (subchapter_id: string, where?: object, withRelated: string[] = []) => {
//   const result = await knex.select('bcq.*')
//     .from('book_content_questions as bcq')
//     .leftJoin('book_contents as bc', 'bc.id', 'bcq.content_id')
//     .where({
//       'bc.subchapter_id': subchapter_id,
//       ...where,
//     })

//   return R.head(result)
// }

export const findClosestInDirectionBySubchapterId = async (subchapter_id: string, subchapter_order: number, dir: 'asc' | 'desc') => {
  const result = await knex.select('bcq.*')
    .from('book_content_questions as bcq')
    .leftJoin('book_contents as bc', 'bc.id', 'bcq.content_id')
    .leftJoin('questions as q', 'q.id', 'bcq.question_id')
    .where({
      'bc.subchapter_id': subchapter_id,
    })
    .whereRaw(`bcq.subchapter_order ${dir === 'asc' ? '>' : '<'} ${subchapter_order}`)
    .whereNull('bc.deleted_at')
    .whereNull('q.deleted_at')
    .orderBy('bcq.subchapter_order', dir)
    .limit(1)

  return R.head(result)
}

// Maybe we should add restrictions regarding removed book contents or questions
export const findBySubchapterId = async (subchapter_id: string, where?: object) => {
  return knex.select('bcq.*')
    .from('book_content_questions as bcq')
    .leftJoin('book_contents as bc', 'bc.id', 'bcq.content_id')
    .where({
      'bc.subchapter_id': subchapter_id,
      ...where,
    })
}
