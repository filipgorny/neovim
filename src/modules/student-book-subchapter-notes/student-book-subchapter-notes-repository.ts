import orm, { StudentBookSubchapterNote } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete,
  _deleteAllByCustomColumn,
  DELETED_AT
} from '../../../utils/generics/repository'
import R from 'ramda'
import { v4 } from 'uuid'

const { knex } = orm.bookshelf
const NATURAL_SORTING = 'natural'

type FetchNotesByStudentIdAndSubchapterIdCommand = CheckIfSpecifiedChapterExistAndBookIsActiveCommand & { select?: string[] }

interface CheckIfSpecifiedChapterExistAndBookIsActiveCommand {
  studentId: string;
  subchapterId: string;
}

interface UpsertSubchapterNoteCommand {
  studentId: string;
  subchapterId: string;
  upsertModel: object;
  select?: string[];
}

const MODEL = StudentBookSubchapterNote
const MODEL_NAME = 'StudentBookSubchapterNote'

const castArrayIfNil = R.ifElse(
  R.isNil,
  R.always([]),
  R.identity
)

const castValueIfEmpty = (defaultValue: any) => R.ifElse(
  R.isEmpty,
  R.always(defaultValue),
  R.identity
)

const generateSelectQuery = R.pipe(
  castArrayIfNil,
  castValueIfEmpty(['*']),
  R.map(R.concat('sbsn.'))
)

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

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
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

export const fetchNotesByStudentIdAndSubchapterId = async (command: FetchNotesByStudentIdAndSubchapterIdCommand) => {
  return knex
    .select(generateSelectQuery(command.select))
    .from({ sbsn: 'student_book_subchapter_notes' })
    .where({
      'sbsn.subchapter_id': command.subchapterId,
      'sbsn.student_id': command.studentId,
      [`sb.${DELETED_AT}`]: null,
    })
    .innerJoin({ sbs: 'student_book_subchapters' }, 'sbs.id', 'sbsn.subchapter_id')
    .innerJoin({ sbc: 'student_book_chapters' }, 'sbc.id', 'sbs.chapter_id')
    .innerJoin({ sb: 'student_books' }, 'sb.id', 'sbc.book_id')
}

const findNotesByStudentBookRaw = (student_book_id: string, student_id: string, query) => async (knex, pagination, order, countTotal = false) => {
  const search = R.path(['filter', 'search'])(query)
  const chapterId = R.path(['filter', 'bc.id'])(query)
  const orderBy = R.propOr('sbsn.id', 'by')(order)
  const orderDir = R.propOr('asc', 'dir')(order)

  let qb = knex.from({ sbsn: 'student_book_subchapter_notes' })
    .select('raw', 'delta_object', 'sbsn.id', 'sbsn.updated_at', 'sbs.*')
    .leftJoin({ sbs: 'student_book_subchapters' }, 'sbsn.subchapter_id', 'sbs.id')
    .leftJoin({ sbc: 'student_book_chapters' }, 'sbs.chapter_id', 'sbc.id')
    .leftJoin({ sb: 'student_books' }, 'sbc.book_id', 'sb.id')
    .where('sb.id', student_book_id)
    .andWhere('sbsn.student_id', student_id)
    .whereNull('sb.deleted_at')
    .groupBy('sbsn.id', 'sbs.id', 'sbc.id', 'sb.id')

  if (orderBy === NATURAL_SORTING) {
    qb = qb.orderBy('sbc.order', orderDir)
      .orderBy('sbs.order', orderDir)
  } else {
    qb = qb.orderBy(orderBy, orderDir)
  }

  if (search) {
    qb = qb.andWhereRaw(`(
      raw ilike '%' || ? || '%'
      or (sbc.order || '.' || sbs.order || ' ' || sbs.title) ilike '%' || ? || '%'
    )`, [search, search])
  }

  if (chapterId) {
    qb = qb.andWhere('sbc.id', chapterId)
  }

  return countTotal
    ? knex.from({ sbsn: 'student_book_subchapter_notes' })
      .leftJoin({ sbs: 'student_book_subchapters' }, 'sbsn.subchapter_id', 'sbs.id')
      .leftJoin({ sbc: 'student_book_chapters' }, 'sbs.chapter_id', 'sbc.id')
      .leftJoin({ sb: 'student_books' }, 'sbc.book_id', 'sb.id')
      .where('sb.id', student_book_id)
      .andWhere('sbsn.student_id', student_id)
      .whereNull('sb.deleted_at')
      .count()
    : qb.limit(pagination.take).offset(pagination.take * (pagination.page - 1))
}

export const fetchNotesByStudentBook = async (query, student_book_id: string, student_id: string) => {
  return fetchRaw(
    MODEL,
    findNotesByStudentBookRaw(student_book_id, student_id, query)
  )(({
    limit: query.limit,
    order: query.order,
  }))
}

const findNotesByStudentCourseRaw = (student_course_id: string, student_id: string, query) => async (knex, pagination, order, countTotal = false) => {
  const search = R.path(['filter', 'search'])(query)
  const orderBy = R.propOr('sbsn.id', 'by')(order)
  const orderDir = R.propOr('asc', 'dir')(order)

  let qb = knex.from({ sbsn: 'student_book_subchapter_notes' })
    .select('raw', 'delta_object', 'sbsn.id', 'sbsn.updated_at', 'sbs.*')
    .leftJoin({ sbs: 'student_book_subchapters' }, 'sbsn.subchapter_id', 'sbs.id')
    .leftJoin({ sbc: 'student_book_chapters' }, 'sbs.chapter_id', 'sbc.id')
    .leftJoin({ sb: 'student_books' }, 'sbc.book_id', 'sb.id')
    .where('sb.course_id', student_course_id)
    .andWhere('sbsn.student_id', student_id)
    .whereNull('sb.deleted_at')
    .groupBy('sbsn.id', 'sbs.id', 'sbc.id', 'sb.id')

  if (orderBy === NATURAL_SORTING) {
    qb = qb.orderBy('sb.title', orderDir)
      .orderBy('sbc.order', orderDir)
      .orderBy('sbs.order', orderDir)
  } else {
    qb = qb.orderBy(orderBy, orderDir)
  }

  if (search) {
    qb = qb.andWhereRaw(`(
      raw ilike '%' || ? || '%'
      or (sbc.order || '.' || sbs.order || ' ' || sbs.title) ilike '%' || ? || '%'
    )`, [search, search])
  }

  return countTotal
    ? knex.from({ sbsn: 'student_book_subchapter_notes' })
      .leftJoin({ sbs: 'student_book_subchapters' }, 'sbsn.subchapter_id', 'sbs.id')
      .leftJoin({ sbc: 'student_book_chapters' }, 'sbs.chapter_id', 'sbc.id')
      .leftJoin({ sb: 'student_books' }, 'sbc.book_id', 'sb.id')
      .where('sb.course_id', student_course_id)
      .andWhere('sbsn.student_id', student_id)
      .whereNull('sb.deleted_at')
      .count()
    : qb.limit(pagination.take).offset(pagination.take * (pagination.page - 1))
}

export const fetchNotesByStudentCourse = async (query, student_course_id: string, student_id: string) => {
  return fetchRaw(
    MODEL,
    findNotesByStudentCourseRaw(student_course_id, student_id, query)
  )(({
    limit: query.limit,
    order: query.order,
  }))
}

export const checkIfSpecifiedChapterExistAndBookIsActive = async (command: CheckIfSpecifiedChapterExistAndBookIsActiveCommand) => {
  const countResult = await knex
    .count('sbs.id')
    .from({ sbs: 'student_book_subchapters' })
    .where({ 'sbs.id': command.subchapterId })
    .innerJoin({ sbc: 'student_book_chapters' }, 'sbc.id', 'sbs.chapter_id')
    .innerJoin({ sb: 'student_books' }, function () {
      this.on('sb.id', 'sbc.book_id')
        .andOnIn('sb.student_id', [command.studentId])
        .andOnNull(`sb.${DELETED_AT}`)
    })
    .first()

  return Boolean(parseInt(countResult.count as string, 10))
}

export const upsertSubchapterNote = async (command: UpsertSubchapterNoteCommand) => {
  const result = await knex('student_book_subchapter_notes')
    .insert({
      id: v4(),
      student_id: command.studentId,
      subchapter_id: command.subchapterId,
      updated_at: new Date(),
      ...command.upsertModel,
    })
    .onConflict(['student_id', 'subchapter_id'])
    .merge(command.upsertModel)
    .returning(command.select ?? '*')

  return R.head(result)
}

export const deleteNotesBySubchapterId = async (content_id: string) => (
  _deleteAllByCustomColumn(MODEL)('subchapter_id', [content_id])
)
