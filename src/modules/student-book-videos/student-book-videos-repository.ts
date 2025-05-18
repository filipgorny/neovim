import * as R from 'ramda'
import { StudentBookVideo, Video } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentCourse } from '../../types/student-course'
import generateStaticUrl from '../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../services/vimeo/get-vimeo-static-link'
import { findOneOrFail as findStudent } from '../students/student-repository'

const MODEL = StudentBookVideo
const MODEL_NAME = 'StudentBookVideo'

export const create = async (dto: {}, trx?) => (
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

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

const fromBookVideos = (studentId: string, studentCourse: StudentCourse, videoId?: string) => (knex, search, filter) => {
  const qb = knex.from('videos as v')
    .leftJoin('student_book_videos as sbv', 'sbv.video_id', 'v.id')
    .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbv.student_subchapter_id')
    .leftJoin('student_book_chapters as sbc', 'sbc.id', 'sbs.chapter_id')
    .leftJoin('student_books as sb', 'sb.id', 'sbc.book_id')
    .leftJoin('student_favourite_videos as sfv', 'v.id', 'sfv.video_id')
    .where('sbv.student_id', studentId)
    // .andWhere('sb.course_id', studentCourse.id)

  // TODO implement checking for free trial
  // if (studentCourse.type === StudentCourseTypes.freeTrial) {
  //   qb.where('bcc.order', 1).where('b.is_free_trial', true)
  // }

  if (search && search.length > 0) {
    qb.whereRaw(`(
      v.title ilike '%' || ? || '%'
      or v.description ilike '%' || ? || '%' 
    )`, [search, search])
  }

  return qb
}

const buildBookVideosQuery = (studentId: string, studentCourse: StudentCourse, videoId?: string) => (filter, search) => async (knex, pagination, order, count = false) => {
  const student = await findStudent({ id: studentId })
  const qb = fromBookVideos(studentId, studentCourse, videoId)(knex, search, filter)
    .select(
      'v.*',
      'sbv.*',
      'sbv.video_id as id',
      // knex.raw('false as is_watched'), // ???
      // knex.raw('0 as video_timestamp'), // ???
      knex.raw('case when v.thumbnail is not null then ? || v.thumbnail else null end as thumbnail', [generateStaticUrl('')]),
      knex.raw('case when ? or v.source_no_bg_music is null then ? || v.source else ? || v.source_no_bg_music end as source', [student.video_bg_music_enabled, getVimeoStaticLink(''), getVimeoStaticLink('')]),
      knex.raw('sfv.id is not null as is_favourite'),
      knex.raw(`
        (
          select json_agg(row_to_json(tags)) from (
              select distinct on (book_id, chapter_order, subchapter_order)
                bo.tag, 
                bo.tag_colour,
                bo.book_id,
                bo.title as book_title,
                bcc.original_chapter_id as chapter_id,
                bcc."order" as chapter_order,
                bs.part,
                bs.original_subchapter_id as subchapter_id,
                bs."order" as subchapter_order,
                bs.title as subchapter_title,
                bc.original_content_id as content_id,
                bc."order" as content_order
              from student_books bo
                left join student_book_chapters bcc on bcc.book_id = bo.id
                left join student_book_subchapters bs on bs.chapter_id = bcc.id 
                left join student_book_contents bc on bc.subchapter_id = bs.id 
                left join student_book_content_resources bcr on bcr.content_id = bc.id 
              where bcr.external_id = v.id 
              and bo.student_id = sbv.student_id
              order by book_id asc, chapter_order asc, subchapter_order asc
          ) as tags
        ) as tags
      `)
    )
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .groupByRaw('sbv.student_id, sb.title, sbs.order, sbc.order, v.id, sfv.id, sbs.id, sb.is_free_trial, sbv.id')
    .orderByRaw('sb.title asc, sbs.order asc, sbc.order asc, v.id asc')
    // .debug(true)

  if (count) {
    const count = await countResults(studentId, studentCourse)(knex, search, filter)

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return qb
}

const countResults = (studentId: string, studentCourse: StudentCourse) => async (knex, search, filter) => (
  fromBookVideos(studentId, studentCourse)(knex, search, filter)
    .select(
      'v.id'
    )
    .groupByRaw('v.id')
    .countDistinct('v.id')
)

export const findStudentBookVideos = (studentId: string, studentCourse: StudentCourse, videoId?: string) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    Video,
    buildBookVideosQuery(studentId, studentCourse, videoId)(filter, search)
  )(query)
}
