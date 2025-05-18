/* eslint-disable @typescript-eslint/no-floating-promises */
import R from 'ramda'
import orm, { Video } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFailWithoutDeleted,
  DELETED_AT,
  _delete,
  _findOneOrFail
} from '../../../utils/generics/repository'
import applyFilters from '../../../utils/query/apply-filters'
import allowedFilters from './query/allowed-filters'
import { videoTitleExistsException } from '../../../utils/error/error-factory'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { VideoCategories } from './video-categories'
import { findOneOrFail as findAdmin } from '../admins/admin-repository'
import { StudentCourse } from '../../types/student-course'
import { StudentCourseTypes } from '../student-courses/student-course-types'
import { int } from '@desmart/js-utils'

const PG_UNIQUE_VIOLATION_ERROR_CODE = '23505'

const MODEL = Video
const MODEL_NAME = 'Video'

export const create = async (dto: {}) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOneOrFailWithDeleted = async (where: object, withRelated: string[] = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = [], disablePagination = false) => (
  fetchCustom(qb)(withRelated, { limit, order }, disablePagination)
)

export const patch = async (id: string, data: object) => {
  try {
    return await _patch(MODEL)(id, data)
  } catch (e) {
    if (e.code === PG_UNIQUE_VIOLATION_ERROR_CODE) {
      throw videoTitleExistsException()
    }
  }
}

export const findVideosWithIds = async (ids: string[]) => R.pipeWith(R.andThen)([
  async () => findCustom(MODEL.whereIn('id', ids))(undefined, undefined, [], true),
  R.prop('data'),
  collectionToJson,
])(true)

export const remove = async (id: string, thumbnail: string, trx?) => (
  _patch(MODEL)(id, {
    [DELETED_AT]: new Date(),
    thumbnail,
  }, trx)
)

export const deleteCompletely = async (id: string) => (
  _delete(MODEL)({ id })
)

const fromBookVideos = (knex, search, filter) => {
  const qb = knex.select('v.id as video_id')
    .from('videos_list_view as v')
    .leftJoin('videos as v2', 'v2.id', 'v.id')
    .leftJoin('book_content_resources as bcr', 'bcr.external_id', 'v.id')
    .leftJoin('book_contents as bc', 'bcr.content_id', 'bc.id')
    .leftJoin('book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('books as b', 'bcc.book_id', 'b.id')

  if (filter?.category && Object.values(VideoCategories).includes(filter.category)) {
    qb.whereRaw(`v2.category='${filter.category}'`)
  }

  if (filter?.category && filter.category === VideoCategories.recordings && filter?.course_end_date_id) {
    qb.whereRaw(`v2.course_end_date_id='${filter.course_end_date_id}'`)
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

const countResults = async (knex, search, filter, courseIds: string[]) => {
  const qb = fromBookVideos(knex, search, filter)
    .select(
      'v.id'
    )
    .whereRaw('v.is_archived = false')
    .groupByRaw('v.id')

  if (courseIds.length > 0) {
    qb.whereIn('v2.course_id', courseIds)
  }

  return qb.countDistinct('v.id')
}

const buildQuery = (filter, search, courseIds: string[]) => async (knex, pagination, order, count = false) => {
  const qb = fromBookVideos(knex, search, filter)
    .select(
      'v.id',
      'v.title',
      'v.description',
      'v.duration',
      'v.source',
      'v.thumbnail',
      'v2.rating',
      'v2.fake_rating',
      'v2.use_fake_rating',
      'v2.category',
      'v2.course_end_date_id',
      'v2.course_id',
      knex.raw(`
      (
        select json_agg(row_to_json(tags)) from (
            select 
              bo.tag, 
              bo.tag_colour,
              bo.id as book_id,
              bo.title as book_title,
              bo.is_locked as book_is_locked,
              bcc.id as chapter_id,
              bcc."order" as chapter_order,
              bs.part,
              bs.id as subchapter_id,
              bs."order" as subchapter_order,
              bs.title as subchapter_title,
              bc.id as content_id,
              bc."order" as content_order
            from books bo
              left join book_chapters bcc on bcc.book_id = bo.id
              left join book_subchapters bs on bs.chapter_id = bcc.id 
              left join book_contents bc on bc.subchapter_id = bs.id 
              left join book_content_resources bcr on bcr.content_id = bc.id 
            where bcr.external_id = v.id
              and bs.deleted_at is null
              and bc.deleted_at is null
              and bo.is_archived is false
        ) as tags
      ) as tags
    `)
    )
    .whereRaw('v.is_archived = false')
    .distinctOn(['v.id'])

  if (courseIds.length > 0) {
    qb.whereIn('v2.course_id', courseIds)
  }

  // Create a subquery with distinctOn before applying pagination
  const distinctQuery = knex
    .select('v.*')
    .from({ v: qb })
    .orderBy(order.by, order.dir, 'NULLS LAST')

  if (count) {
    const count = await countResults(knex, search, filter, courseIds)

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  // Apply pagination to the distinct results
  return distinctQuery
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
}

export const findVideos = async (query, filter, user) => {
  const profile = await findAdmin({ id: user.id }, ['adminCourses.course'])
  const search = R.propOr('', 'search')(filter)

  const courseIds = R.pipe(
    R.pathOr([], ['adminCourses']),
    R.pluck('course'),
    R.pluck('id')
  )(profile)

  return fetchRaw(
    MODEL,
    buildQuery(filter, search, courseIds)
  )(query)
}

export const countByTitle = (title: string) => (
  MODEL.where({ title, [DELETED_AT]: null })
    .count('id')
)

export const unarchiveVideo = async (id: string) => (
  patch(id, { is_archived: false })
)

export const archiveVideo = async (id: string) => (
  patch(id, { is_archived: true })
)

export const calculateVideoRating = async (videoId: string) => {
  const knex = orm.bookshelf.knex

  const result = await knex.select(knex.raw('avg(rating) as rating'))
    .from('student_video_ratings')
    .where('video_id', videoId)

  const rating = R.pipe(
    R.head,
    R.prop('rating')
  )(result)

  return Math.round(rating * 10) / 10
}

export const fetchVideosByCategory = (studentId: string, studentCourse?: StudentCourse) => async (query) => {
  const knex = orm.bookshelf.knex
  const filter = query.filter
  const pagination = query.limit

  // Base query builder
  const baseQuery = knex.from('videos as v').whereNull(DELETED_AT)
    .leftJoin(knex.raw('favourite_videos as fv on fv.video_id = v.id and fv.student_id = ?', [studentId]))
    .leftJoin(knex.raw('student_videos as sv on sv.video_id = v.id and sv.student_id = ?', [studentId]))
    .select([
      'v.*',
      knex.raw('CASE WHEN fv.video_id IS NOT NULL THEN true ELSE false END as is_favourite'),
      knex.raw(`CASE 
        WHEN sv.delta_object ILIKE '%is_watched":true%' THEN true 
        ELSE false 
      END as is_watched`),
    ])
    .modify(function (queryBuilder) {
      if (filter?.category && Object.values(VideoCategories).includes(filter.category)) {
        queryBuilder.where('v.category', filter.category)
      }

      if (filter?.category && filter.category === VideoCategories.recordings) {
        queryBuilder.where('v.course_end_date_id', studentCourse.end_date_id)
      }

      if (filter?.category && [VideoCategories.medreel, VideoCategories.review].includes(filter.category)) {
        queryBuilder.where('v.course_id', studentCourse.book_course_id)
      }

      if (filter?.course_id) {
        queryBuilder.where('v.course_id', filter.course_id)
      }

      if (filter?.search) {
        queryBuilder.whereRaw(`(
          v.title ilike '%' || ? || '%'
          or v.description ilike '%' || ? || '%'
        )`, [filter.search, filter.search])
      }

      if (filter?.__is_watched) {
        (parseInt(filter.__is_watched) === 1)
          ? queryBuilder.whereRaw('sv.delta_object ILIKE \'%is_watched":true%\'')
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          : queryBuilder.where(qb => qb.whereRaw('sv.delta_object ILIKE \'%is_watched":false%\'')
            .orWhereNull('sv.delta_object'))
      }
    })

  // Get total count
  // @ts-ignore
  const [{ count: recordsTotal }] = await baseQuery.clone()
    .clearSelect()
    .select(knex.raw('count(distinct v.id) as count'))

  // Get paginated data
  const data = await baseQuery
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

export const fetchVideosWithFavorites = (studentId: string, courseId: string, studentCourse: StudentCourse) => async (query) => {
  const knex = orm.bookshelf.knex
  const pagination = query.limit
  const filter = query.filter || {}

  // Define the columns we want to select
  const columns = [
    'v.id',
    'v.title',
    'v.description',
    'v.source_no_bg_music',
    'v.source',
    'v.thumbnail',
    'v.duration',
    'v.deleted_at',
    'v.is_archived',
    'v.rating',
    'v.fake_rating',
    'v.use_fake_rating',
    'v.category',
    'v.course_end_date_id',
    'v.course_id',
  ]

  // Create the union query
  const unionQuery = knex
    .select(knex.raw('DISTINCT ON (id) *'))
    .from(
      knex
        .select([
          ...columns,
          knex.raw('(CASE WHEN fv.video_id IS NOT NULL THEN true ELSE false END)::boolean as is_favourite'),
          knex.raw(`(CASE 
            WHEN sv.delta_object ILIKE '%is_watched":true%' THEN true 
            ELSE false 
          END)::boolean as is_watched`),
          knex.raw('null::uuid as resource_id'),
        ])
        .from('videos as v')
        .leftJoin('favourite_videos as fv', function () {
          this.on('fv.video_id', '=', 'v.id')
            .andOn('fv.student_id', '=', knex.raw('?', [studentId]))
        })
        .leftJoin('student_videos as sv', function () {
          this.on('sv.video_id', '=', 'v.id')
            .andOn('sv.student_id', '=', knex.raw('?', [studentId]))
        })
        .whereNull('v.deleted_at')
        .whereNotIn('v.category', [VideoCategories.books, VideoCategories.draft])
        .modify(function (queryBuilder) {
          // Apply custom filters to the first part of the union
          if (filter.__is_watched) {
            (int(filter.__is_watched) === 1)
              ? queryBuilder.whereRaw('sv.delta_object ILIKE \'%is_watched":true%\'')
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              : queryBuilder.where(qb => qb.whereRaw('sv.delta_object ILIKE \'%is_watched":false%\'')
                .orWhereNull('sv.delta_object'))
          }

          if (filter.search) {
            queryBuilder.whereRaw(`(
              v.title ilike '%' || ? || '%'
              or v.description ilike '%' || ? || '%'
            )`, [filter.search, filter.search])
          }

          queryBuilder.whereRaw(`
            NOT (v.category = 'recordings' AND v.course_end_date_id != ?)
          `, [studentCourse.end_date_id])

          queryBuilder.whereRaw(`
            NOT (v.category IN ('medreel', 'review') AND v.course_id != ?)
          `, [studentCourse.book_course_id])
        })
        .unionAll(function () {
          this.select([
            'distinct_videos.id',
            'distinct_videos.title',
            'distinct_videos.description',
            'distinct_videos.source_no_bg_music',
            'distinct_videos.source',
            'distinct_videos.thumbnail',
            'distinct_videos.duration',
            'distinct_videos.deleted_at',
            'distinct_videos.is_archived',
            'distinct_videos.rating',
            'distinct_videos.fake_rating',
            'distinct_videos.use_fake_rating',
            'distinct_videos.category',
            'distinct_videos.course_end_date_id',
            'distinct_videos.course_id',
            knex.raw('(CASE WHEN sfv.video_id IS NOT NULL THEN true ELSE false END)::boolean as is_favourite'),
            knex.raw(`(CASE 
              WHEN sbcr.delta_object ILIKE '%is_watched":true%' THEN true 
              ELSE false 
            END)::boolean as is_watched`),
            'sbcr.id as resource_id',
          ])
            .from(function () {
              this.distinct(columns)
                .from('videos as v')
                .leftJoin('student_book_content_resources as sbcr', 'sbcr.external_id', 'v.id')
                .leftJoin('student_book_contents as sbc', 'sbc.id', 'sbcr.content_id')
                .leftJoin('student_book_subchapters as sbs', 'sbs.id', 'sbc.subchapter_id')
                .leftJoin('student_book_chapters as sbc2', 'sbc2.id', 'sbs.chapter_id')
                .leftJoin('student_books as sb', 'sb.id', 'sbc2.book_id')
                .where('sb.course_id', courseId)
                .whereNotIn('v.category', [VideoCategories.draft])
                .modify(function (queryBuilder) {
                  // Apply custom filters to the second part of the union
                  if (filter.__is_watched) {
                    (int(filter.__is_watched) === 1)
                      ? queryBuilder.whereRaw('sbcr.delta_object ILIKE \'%is_watched":true%\'')
                      : queryBuilder.where(qb => qb.whereRaw('sbcr.delta_object ILIKE \'%is_watched":false%\'')
                        .orWhereNull('sbcr.delta_object'))
                  }
                  if (filter.search) {
                    queryBuilder.whereRaw(`(
                      v.title ilike '%' || ? || '%'
                      or v.description ilike '%' || ? || '%'
                    )`, [filter.search, filter.search])
                  }
                })
                .as('distinct_videos')

              if (studentCourse.type === StudentCourseTypes.freeTrial) {
                this.whereNotIn('v.category', [VideoCategories.medreel])
                this.where('sbc2.order', 1).where('sb.is_free_trial', true)
              }
            })
            .leftJoin('student_favourite_videos as sfv', function () {
              this.on('sfv.video_id', '=', 'distinct_videos.id')
                .andOn('sfv.course_id', '=', knex.raw('?', [courseId]))
                .andOn('sfv.student_id', '=', knex.raw('?', [studentId]))
            })
            .leftJoin('student_book_content_resources as sbcr', 'sbcr.external_id', 'distinct_videos.id')
            .leftJoin('student_videos as sv', 'sv.video_id', 'distinct_videos.id')
        })
        .as('union_results')
    )
    .orderBy('id')
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
    // .debug(true)

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
