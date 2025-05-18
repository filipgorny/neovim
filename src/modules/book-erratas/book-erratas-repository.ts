import orm, { BookErrata } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

const MODEL = BookErrata
const MODEL_NAME = 'BookErrata'

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

export const findBookErratasForStudent = async (student_id: string, book_id: string, take: number, page: number) => (
  orm.bookshelf.knex({ be: 'book_erratas' })
    .select(orm.bookshelf.knex.raw('distinct(be.*), b.tag, b.tag_colour, bc.order as chapter_order, bs.part, bs.order as subchapter_order'))
    .leftJoin('books as b', 'b.id', 'be.book_id')
    .leftJoin('book_chapters as bc', 'bc.id', 'be.chapter_id')
    .leftJoin('book_subchapters as bs', 'bs.id', 'be.subchapter_id')
    .leftJoin('student_books as sb', 'be.book_id', 'sb.book_id')
    .where('be.book_id', book_id)
    .andWhereRaw('be.created_at between sb.created_at and now()')
    .andWhere('sb.student_id', student_id)
    .orderBy('be.created_at', 'desc')
    .limit(take)
    .offset(take * (page - 1))
)

export const findBookErratasForAdmin = async (book_id: string, take: number, page: number) => (
  orm.bookshelf.knex({ be: 'book_erratas' })
    .select(orm.bookshelf.knex.raw('distinct(be.*), b.tag, b.tag_colour, bc.order as chapter_order, bs.part, bs.order as subchapter_order'))
    .leftJoin('books as b', 'b.id', 'be.book_id')
    .leftJoin('book_chapters as bc', 'bc.id', 'be.chapter_id')
    .leftJoin('book_subchapters as bs', 'bs.id', 'be.subchapter_id')
    .where('be.book_id', book_id)
    .orderBy('be.created_at', 'desc')
    .limit(take)
    .offset(take * (page - 1))
)
