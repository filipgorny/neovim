import * as R from 'ramda'
import orm, { StudentBookContentPin } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import applyFilters from '../../../utils/query/apply-filters'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentCourse } from '../../types/student-course'

const MODEL = StudentBookContentPin
const MODEL_NAME = 'StudentBookContentPin'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
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

const pinNotePresenceInBookBySubchaptersQuery = (student_book_id: string) => async (knex, pagination, order, count = false) => {
  const qb = knex.from('student_book_content_pins as sbcp')
    .leftJoin('student_book_contents as sbc2', 'sbc2.id', 'sbcp.content_id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbc2.subchapter_id')
    .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
    .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
    .where('sb.id', student_book_id)
    .andWhereRaw('student_id = sb.student_id')

  if (count) {
    return qb
      .select(knex.raw('count (distinct sbs.id)'))
  } else {
    return qb
      .select(knex.raw(
        'distinct(sbs.id) as subchapter_id, sbs.title as subchapter_title, sbs.chapter_id, sbs.order as subchapter_order, sbs.part,' +
        'sbc.book_id, sbc.order as chapter_order,' +
        'sb.tag, sb.tag_colour, sb.book_id as book_original_id, count (sbcp.id) as pin_count, (sbc.order * 100 + sbs.order) as chapter_order_subchapter'
      ))
      .groupByRaw('sbs.id, sbc.book_id, sbc.order, sb.tag, sb.tag_colour, sb.book_id')
      .orderByRaw('chapter_order_subchapter asc')
      .limit(pagination.take)
      .offset(pagination.take * (pagination.page - 1))
  }
}

export const pinNotePresenceInBookBySubchapters = (studentBookId: string, query) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    pinNotePresenceInBookBySubchaptersQuery(studentBookId)
  )({
    limit: query.limit,
    order: {},
  }),
])(true)

const pinNotePresenceInCourseBySubchaptersQuery = (student_course_id: string) => async (knex, pagination, order, count = false) => {
  const qb = knex.from('student_book_content_pins as sbcp')
    .leftJoin('student_book_contents as sbc2', 'sbc2.id', 'sbcp.content_id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbc2.subchapter_id')
    .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
    .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
    .leftJoin('student_courses as sc', 'sc.student_id', 'sb.student_id')
    .where('sc.id', student_course_id)

  if (count) {
    return qb
      .select(knex.raw('count (distinct sbs.id)'))
  } else {
    return qb
      .select(knex.raw(
        'distinct(sbs.id) as subchapter_id, sbs.title as subchapter_title, sbs.chapter_id, sbs.order as subchapter_order, sbs.part,' +
        'sbc.book_id, sbc.order as chapter_order,' +
        'sb.tag, sb.tag_colour, sb.book_id as book_original_id, count (sbcp.id) as pin_count, (sbc.order * 100 + sbs.order) as chapter_order_subchapter'
      ))
      .groupByRaw('sbs.id, sbc.book_id, sbc.order, sb.tag, sb.tag_colour, sb.book_id')
      .orderByRaw('chapter_order_subchapter asc')
      .limit(pagination.take)
      .offset(pagination.take * (pagination.page - 1))
  }
}

export const pinNotePresenceInCourseBySubchapters = (studentCourseId: string, query) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    pinNotePresenceInCourseBySubchaptersQuery(studentCourseId)
  )({
    limit: query.limit,
    order: {},
  }),
])(true)

const fetchPinNotesBySubchaptersQuery = (student_book_id: string, student_book_subchapter_id: string, filter = undefined) => async (knex, pagination, order, count = false) => {
  const qb = knex.from('student_book_content_pins as sbcp')
    .leftJoin('student_book_contents as sbc2', 'sbc2.id', 'sbcp.content_id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbc2.subchapter_id')
    .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
    .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
    .leftJoin('student_pin_variants as spv', 'spv.variant', 'sbcp.variant')
    .where('sb.id', student_book_id)
    .andWhere('sbs.id', student_book_subchapter_id)
    .andWhere('spv.student_book_id', student_book_id)
    .andWhereRaw('spv.student_id = sb.student_id')

  applyFilters(['sbcp.variant'])(qb, knex, filter)

  if (count) {
    return qb
      .select(knex.raw('count (distinct sbcp.id)'))
      .groupBy('sbs.id')
  } else {
    return qb
      .select(knex.raw('sbcp.*, spv.title, spv.student_book_id'))
      .limit(pagination.take)
      .offset(pagination.take * (pagination.page - 1))
  }
}

export const fetchPinNotesBySubchapters = (studentBookId: string, subchapterId: string, query) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    fetchPinNotesBySubchaptersQuery(studentBookId, subchapterId, query.filter)
  )({
    limit: query.limit,
    order: {},
  }),
])(true)

export const countPinNotes = async (studentCourse: StudentCourse, student_book_id?: string) => {
  const knex = orm.bookshelf.knex
  const qb = knex.from('student_book_content_pins as sbcp')
    .select(knex.raw('count (sbcp.id)'))
    .leftJoin('student_book_contents as sbc2', 'sbc2.id', 'sbcp.content_id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbc2.subchapter_id')
    .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
    .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
    .leftJoin('student_courses as sc', 'sc.student_id', 'sb.student_id')
    .where('sb.student_id', studentCourse.student_id)
    .andWhere('sc.id', studentCourse.id)

  if (student_book_id) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    qb.andWhere('sb.id', student_book_id)
      .groupBy('sb.id')
  }

  const result = await qb

  return R.pipe(
    R.head,
    R.prop('count'),
    R.objOf('pin_notes_count')
  )(result)
}
