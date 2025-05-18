import R from 'ramda'
import StudentBookContentResourceDTO from './dto/student-book-content-resource-dto'
import orm, { StudentBookContentResource } from '../../models'
import { DELETED_AT, _create, _findOneOrFail, _patch, _patchAll, _deleteAllByCustomColumn, _delete, _findOne } from '../../../utils/generics/repository'
import { throwException, notFoundException } from '../../../utils/error/error-factory'
import { BookContentResourceTypeEnum } from '../book-content-resources/book-contennt-resource-types'
import { fetch, fetchRawSimple } from '../../../utils/model/fetch'

const { knex } = orm.bookshelf

const MODEL = StudentBookContentResource
const MODEL_NAME = 'StudentBookContentResource'

export const create = async (dto: StudentBookContentResourceDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const patch = async (id: string, data) => (
  _patch(MODEL)(id, data)
)

export const find = async (where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated)
)

export const findWithQuery = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const patchWhereIn = async (ids: string[], data: object) => (
  _patchAll(MODEL)(ids, data)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOne = async (where: object, withRelated: string[] = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const fetchStudentVideoResource = async (externalId: string, studentId: string): Promise<[any, string[]]> => {
  const result = await knex({ sbcr: 'student_book_content_resources' })
    .leftJoin({ v: 'videos' }, 'v.id', 'sbcr.external_id')
    .innerJoin({ sbc: 'student_book_contents' }, 'sbc.id', 'sbcr.content_id')
    .innerJoin({ sbs: 'student_book_subchapters' }, 'sbs.id', 'sbc.subchapter_id')
    .innerJoin({ sbca: 'student_book_chapters' }, 'sbca.id', 'sbs.chapter_id')
    .innerJoin({ sb: 'student_books' }, join => {
      join.on('sb.id', 'sbca.book_id')
        .andOnIn('sb.student_id', [studentId])
        .andOnNull(`sb.${DELETED_AT}`)
    })
    .where('sb.student_id', studentId)
    .where('sbcr.external_id', externalId)
    .where('sbcr.type', BookContentResourceTypeEnum.video)
    .select('sbcr.*', 'v.duration')

  if (!result?.length || !(result?.length > 0)) {
    throwException(notFoundException(MODEL_NAME))
  }

  return [R.head(result), R.pluck('id')(result)]
}

export const checkIfSpecifiedBookContentResourceExist = async (resourceId: string, studentId: string) => {
  const result = await knex({ sbcr: 'student_book_content_resources' })
    .count('sbcr.id')
    .where({ 'sbcr.id': resourceId })
    .innerJoin({ sbc: 'student_book_contents' }, 'sbc.id', 'sbcr.content_id')
    .innerJoin({ sbs: 'student_book_subchapters' }, 'sbs.id', 'sbc.subchapter_id')
    .innerJoin({ sbca: 'student_book_chapters' }, 'sbca.id', 'sbs.chapter_id')
    .innerJoin({ sb: 'student_books' }, join => {
      join.on('sb.id', 'sbca.book_id')
        .andOnIn('sb.student_id', [studentId])
        .andOnNull(`sb.${DELETED_AT}`)
    })
    .first()

  return Boolean(parseInt(result.count as string, 10))
}

export const getUnseenVideosInChaptersCount = (student_id) => async (ids: string[]) => (
  fetchRawSimple({}, qb => {
    return qb.select(
      'sbc.id as chapter_id',
      'sbc.book_id',
      knex.raw('count(distinct sbcr.id) filter (where sbcr.is_read = false) as unseen_count'),
      knex.raw('count(distinct sbcr.id) as total_count')
    ).from('student_book_chapters as sbc')
      .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
      .leftJoin('student_book_subchapters as sbs', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_book_contents as sbc2', 'sbs.id', 'sbc2.subchapter_id')
      .leftJoin('student_book_content_resources as sbcr', 'sbc2.id', 'sbcr.content_id')
      .where('sbcr.type', 'video')
      .where('sb.student_id', student_id)
      .whereIn('sbc.id', ids)
      .groupByRaw('sbc.id')
  })
)

export const getUnseenVideosInBookCount = (student_id) => async (ids: string[]) => (
  fetchRawSimple({}, qb => {
    return qb.select(
      'sbc.book_id',
      knex.raw('count(distinct sbcr.id) filter (where sbcr.is_read = false) as unseen_count'),
      knex.raw('count(distinct sbcr.id) as total_count')
    ).from('student_book_chapters as sbc')
      .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
      .leftJoin('student_book_subchapters as sbs', 'sbc.id', 'sbs.chapter_id')
      .leftJoin('student_book_contents as sbc2', 'sbs.id', 'sbc2.subchapter_id')
      .leftJoin('student_book_content_resources as sbcr', 'sbc2.id', 'sbcr.content_id')
      .where('sbcr.type', 'video')
      .where('sb.student_id', student_id)
      .whereIn('sb.id', ids)
      .groupByRaw('sbc.book_id')
  })
)

export const deleteResourcesByContentId = async (content_id: string) => (
  _deleteAllByCustomColumn(MODEL)('content_id', [content_id])
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)
