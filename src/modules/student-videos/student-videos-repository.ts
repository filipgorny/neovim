/* eslint-disable @typescript-eslint/no-misused-promises */
import R from 'ramda'
import { _findOneOrFailWithoutDeleted } from '@desmart/js-utils'
import { _create, _delete, _findOne, _patch } from '../../../utils/generics/repository'
import { fetchRaw } from '../../../utils/model/fetch'
import applyFilters from '../../../utils/query/apply-filters'
import orm, { Video, StudentVideo } from '../../models'
import { StudentCourse } from '../../types/student-course'
import { VideoCategories } from '../videos/video-categories'
import allowedFilters from './query/allowed-filters'
import { StudentCourseTypes } from '../student-courses/student-course-types'
import generateStaticUrl from '../../../services/s3/generate-static-url'
import { findOneOrFail } from '../students/student-repository'
import getVimeoStaticLink from '../../../services/vimeo/get-vimeo-static-link'

const fromBookVideos = (studentId: string, studentCourse: StudentCourse, videoId?: string) => (knex, search, filter) => {
  const qb = knex.from('videos as v')
    .leftJoin('student_book_content_resources as bcr', 'bcr.external_id', 'v.id')
    .leftJoin('student_book_contents as bc', 'bcr.content_id', 'bc.id')
    .leftJoin('student_book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('student_book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('student_books as b', 'bcc.book_id', 'b.id')
    .leftJoin('student_favourite_videos as sfv', 'bcr.id', 'sfv.resource_id')
    .where('b.student_id', studentId)
    .andWhere('b.course_id', studentCourse.id)

  // This is an artificial category on the front end
  // It means we want to fetch all videos attached to books
  // but not recording or onboarding videos
  if (filter?.category && filter.category === 'books') {
    qb.whereNull('v.category')
  }

  if (filter?.category && Object.values(VideoCategories).includes(filter.category)) {
    qb.where('v.category', filter.category)
  }

  if (videoId) {
    qb.andWhere('v.id', videoId)
  }

  if (studentCourse.type === StudentCourseTypes.freeTrial) {
    qb.where('bcc.order', 1).where('b.is_free_trial', true)
  }

  applyFilters(allowedFilters)(qb, knex, filter)

  if (search && search.length > 0) {
    qb.whereRaw(`(
      v.title ilike '%' || ? || '%'
      or v.description ilike '%' || ? || '%' 
    )`, [search, search])
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

const buildQuery = (studentId: string, studentCourse: StudentCourse, videoId?: string) => (filter, search) => async (knex, pagination, order, count = false) => {
  const student = await findOneOrFail({ id: studentId })
  const qb = fromBookVideos(studentId, studentCourse, videoId)(knex, search, filter)
    .select(
      'v.id',
      'v.title',
      'v.description',
      'v.duration',
      'v.source',
      'v.source_no_bg_music',
      'v.thumbnail',
      'v.rating',
      'v.fake_rating',
      'v.use_fake_rating',
      'v.category',
      'b.student_id',
      knex.raw('bcr.delta_object::jsonb as delta_object'),
      'b.title as book_title',
      'b.is_free_trial',
      'bcc.order as chapter_order',
      'bcr.id as resource_id',
      'bs.order as subchapter_order',
      'bs.id as student_subchapter_id',
      'bc.order as content_order',
      knex.raw('false as is_watched'),
      knex.raw('0 as video_timestamp'),
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
              and bo.student_id = b.student_id
              order by book_id asc, chapter_order asc, subchapter_order asc
          ) as tags
        ) as tags
      `)
    )
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .groupByRaw('b.student_id, b.title, bcc.order, bs.order, bc.order, v.id, bcr.id, bcr.delta_object, sfv.id, bs.id, b.is_free_trial')
    .orderByRaw('b.title asc, bcc.order asc, bs.order asc, bc.order asc, v.id asc, bcr.delta_object asc NULLS LAST')

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

const buildQueryForCount = (studentId: string, studentCourse: StudentCourse, videoId?: string) => (filter, search) => async (knex, pagination, order, count = false) => {
  const student = await findOneOrFail({ id: studentId })
  const qb = fromBookVideos(studentId, studentCourse, videoId)(knex, search, filter)
    .select(
      'v.id',
      'v.title',
      'v.description',
      'v.duration',
      'v.source',
      'v.source_no_bg_music',
      'v.thumbnail',
      'v.rating',
      'v.fake_rating',
      'v.use_fake_rating',
      'v.category',
      'b.student_id',
      knex.raw('bcr.delta_object::jsonb as delta_object'),
      'b.title as book_title',
      'b.is_free_trial',
      'bcc.order as chapter_order',
      'bcr.id as resource_id',
      'bs.order as subchapter_order',
      'bs.id as student_subchapter_id',
      'bc.order as content_order',
      knex.raw('sfv.id is not null as is_favourite')
    )
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

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

export const findStudentVideos = (studentId: string, studentCourse: StudentCourse, videoId?: string) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    Video,
    buildQuery(studentId, studentCourse, videoId)(filter, search)
  )(query)
}

export const findStudentVideosCount = (studentId: string, studentCourse: StudentCourse, videoId?: string) => async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    Video,
    buildQueryForCount(studentId, studentCourse, videoId)(filter, search)
  )(query)
}

export const create = async (dto) => (
  _create(StudentVideo)(dto)
)

export const patch = async (id: string, data) => (
  _patch(StudentVideo)(id, data)
)

export const findOne = async (where: {}) => (
  _findOne(StudentVideo)(where)
)

export const deleteRecord = async (id: string) => (
  _delete(StudentVideo)({ id })
)

const filterWatchedVideos = R.filter(
  R.pipe(
    R.prop('delta_object'),
    R.when(
      R.has('is_watched'),
      R.propEq('is_watched', true)
    )
  )
)

export const getBookVideosWatchedPercentage = async (studentCourse: StudentCourse) => {
  const knex = orm.bookshelf.knex

  const results = await knex.raw(`
    select
      "v"."id" as video_id, sv.id as student_video_id , sv.delta_object 
    from
      "videos" as "v"
    left join "student_book_content_resources" as "bcr" on
      "bcr"."external_id" = "v"."id"
    left join "student_book_contents" as "bc" on
      "bcr"."content_id" = "bc"."id"
    left join "student_book_subchapters" as "bs" on
      "bc"."subchapter_id" = "bs"."id"
    left join "student_book_chapters" as "bcc" on
      "bs"."chapter_id" = "bcc"."id"
    left join "student_books" as "b" on
      "bcc"."book_id" = "b"."id"
    left join student_videos sv on (sv.video_id = v.id and sv.student_id = b.student_id)
    where
      "b"."student_id" = '${studentCourse.student_id}'
      and "b"."course_id" = '${studentCourse.id}'
      and "v"."category" = 'books'
  `)

  const allVideos = results.rows
  const watchedVideos = filterWatchedVideos(results.rows)

  return Math.round(100 * watchedVideos.length / allVideos.length)
}

export const fetchFavoriteVideos = (studentId: string, studentCourse: StudentCourse) => async (query) => {
  const knex = orm.bookshelf.knex
  const pagination = query.limit
  const filter = query.filter

  // Create the union query with DISTINCT ON
  const unionQuery = knex
    .select(knex.raw('DISTINCT ON (union_results.id) *'))
    .from(
      knex
        .select([
          'v.*',
          'sfv.resource_id as resource_id',
          knex.raw(`CASE 
            WHEN sv.delta_object ILIKE '%is_watched":true%' THEN true 
            ELSE false 
          END as is_watched`),
          knex.raw('true as is_favourite'),
        ])
        .from('student_favourite_videos as sfv')
        .leftJoin('videos as v', 'v.id', 'sfv.video_id')
        .leftJoin('student_videos as sv', 'sv.video_id', 'v.id')
        .where('sfv.student_id', studentId)
        .where('sfv.course_id', studentCourse.id)
        .modify(function (queryBuilder) {
          if (filter?.__is_watched) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            (parseInt(filter.__is_watched) === 1)
              ? queryBuilder.whereRaw('sv.delta_object ILIKE \'%is_watched":true%\'')
              : queryBuilder.where(qb => qb.whereRaw('sv.delta_object ILIKE \'%is_watched":false%\'')
                .orWhereNull('sv.delta_object'))
          }
          if (filter?.search) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            queryBuilder.whereRaw(`(
              v.title ilike '%' || ? || '%'
              or v.description ilike '%' || ? || '%'
            )`, [filter.search, filter.search])
          }
          if (filter?.category) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            queryBuilder.where('v.category', filter.category)
          }
        })
        .unionAll(function () {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.select([
            'v.*',
            knex.raw('null as resource_id'),
            knex.raw(`CASE 
              WHEN sv.delta_object ILIKE '%is_watched":true%' THEN true 
              ELSE false 
            END as is_watched`),
            knex.raw('true as is_favourite'),
          ])
            .from('favourite_videos as fv')
            .leftJoin('videos as v', 'v.id', 'fv.video_id')
            .leftJoin('student_videos as sv', 'sv.video_id', 'v.id')
            .where('fv.student_id', studentId)
            .where(qb => {
              qb.where('v.course_id', studentCourse.book_course_id)
                .orWhereNull('v.course_id')
            })
            .modify(function (queryBuilder) {
              if (filter?.__is_watched) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                (parseInt(filter.__is_watched) === 1)
                  ? queryBuilder.whereRaw('sv.delta_object ILIKE \'%is_watched":true%\'')
                  : queryBuilder.where(qb => qb.whereRaw('sv.delta_object ILIKE \'%is_watched":false%\'')
                    .orWhereNull('sv.delta_object'))
              }
              if (filter?.search) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                queryBuilder.whereRaw(`(
                  v.title ilike '%' || ? || '%'
                  or v.description ilike '%' || ? || '%'
                )`, [filter.search, filter.search])
              }
              if (filter?.category) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                queryBuilder.where('v.category', filter.category)
              }
            })
        })
        .as('union_results')
    )
    .orderBy('union_results.id')
    .as('combined_videos')

  // Get total count
  const [{ count: recordsTotal }] = await knex
    .count('* as count')
    .from(unionQuery)

  // Get paginated data
  const data = await knex
    .select('*')
    .from(unionQuery)
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  return {
    data,
    meta: {
      page: pagination.page,
      take: pagination.take,
      recordsTotal: parseInt(recordsTotal as string),
      pagesTotal: Math.ceil(parseInt(recordsTotal as string) / pagination.take),
    },
  }
}
