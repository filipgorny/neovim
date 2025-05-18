import * as R from 'ramda'
import orm, { StudentCourse } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { StudentCourseDTO } from '../../types/student-course'
import { StudentCourseTypes } from './student-course-types'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import moment from 'moment'
import { StudentCourseStatus } from './student-course-status'
import { detachAllByCourse } from '../attached-exams/attached-exams-service'
import { deleteStudentCourse } from './student-course-service'

const { knex } = orm.bookshelf

const MODEL = StudentCourse
const MODEL_NAME = 'StudentCourse'

export const createStudentCourse = async (dto: StudentCourseDTO) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated?: string[]) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: Partial<StudentCourseDTO>) => (
  _patch(MODEL)(id, data)
)

export const removeSoftly = async (id: string) => (
  patch(id, { is_deleted: true })
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteFirstSoftlyRemovedStudentCourse = async () => {
  const studentCourse = await knex.from({ sc: 'student_courses' }).where('sc.is_deleted', true).first()

  if (!studentCourse) {
    return
  }

  await deleteStudentCourse(studentCourse.id, {})
}

export const fetchExistingCourseCount = (externalCreatedAt: string, book_course_id: string, student_id: string) => (
  MODEL.where({
    book_course_id,
    student_id,
  }).andWhere('external_created_at', '>=', externalCreatedAt)
    .andWhere('type', '!=', StudentCourseTypes.freeTrial)
    .count()
)

export const findFreeTrial = async (book_course_id: string, student_id: string) => (
  findOne({
    book_course_id,
    student_id,
    type: StudentCourseTypes.freeTrial,
  })
)

export const findLatestCourse = async (book_course_id: string, student_id: string) => {
  const result = await find({
    limit: { page: 1, take: 1 },
    order: { by: 'external_created_at', dir: 'desc' },
  }, {
    student_id,
    book_course_id,
  })

  return R.pipe(
    R.prop('data'),
    collectionToJson,
    R.head
  )(result)
}

const now = () => moment().format('YYYY-MM-DD')
const threeDaysFromNow = () => moment().add(3, 'days').format('YYYY-MM-DD')

export const findCoursesToExpireNow = async () => (
  findCustom(
    MODEL.whereRaw('accessible_to::text like ? || \'%\'', now())
  )(undefined, undefined, ['student'])
)

export const findCoursesThatShouldBeExpired = async () => (
  findCustom(
    MODEL.whereRaw(`accessible_to < '${now()}'`)
      .andWhere('status', StudentCourseStatus.ongoing)
  )(undefined, undefined, ['student'])
)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'id',
    dir: 'desc',
  },
})

export const fetchCoursesThatShouldBeExpired = (batchNumber: number, step: number) => async () => (
  fetch(MODEL)(`accessible_to < '${now()}' and status = '${StudentCourseStatus.ongoing}'`,
    ['student'],
    buildPaginationData(batchNumber, step)
  )
)

export const findCoursesToExpireInThreeDays = async () => (
  findCustom(
    MODEL.whereRaw('accessible_to::text like ? || \'%\'', threeDaysFromNow())
  )(undefined, { by: 'external_created_at', dir: 'desc' }, ['student'])
)

export const getAllCourseIds = async (): Promise<string[]> => (
  R.pipeWith(R.andThen)([
    async () => knex.from({ sc: 'student_courses' }),
    R.pluck('id'),
  ])(true)
)

const buildSearchForPhraseInCourse = (studentCourseId: string, search: string) => async knex => (
  knex.from('student_books AS sb')
    .select(
      knex.raw(
        'sbc2.id as student_book_content_id,' +
        'sbc2.raw as content_raw,' +
        'sb.book_id as original_book_id,' +
        'sbc."order" as chapter_order,' +
        'sbs.part,' +
        'sbs."order" as subchapter_order,' +
        'sbs.id as student_subchapter_id,' +
        'sbcr.raw as resource_raw,' +
        'sbc.order * 100 + sbs.order as order_combined'
      ),
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
              where bcc.id = sbc.id
              and bs.id = sbs.id
              and bo.student_id = sb.student_id
              order by book_id asc, chapter_order asc, subchapter_order asc
          ) as tags
        )::text as tag
      `)
    )
    .leftJoin('student_book_chapters AS sbc', 'sbc.book_id', 'sb.id')
    .leftJoin('student_book_subchapters AS sbs', 'sbs.chapter_id', 'sbc.id')
    .leftJoin('student_book_contents AS sbc2', 'sbc2.subchapter_id', 'sbs.id')
    .leftJoin('student_book_content_resources AS sbcr', 'sbcr.content_id', 'sbc2.id')
    .where('sb.course_id', studentCourseId)
    .andWhereRaw(`(
      sbc2.raw ilike '%${search}%'
      or sbcr.raw ilike '%${search}%'
    )`)
    .orderByRaw('original_book_id asc, order_combined asc')
)

export const searchForPhraseInCourse = (studentCourseId: string, search: string) => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildSearchForPhraseInCourse(studentCourseId, search)
  )({
    limit: undefined,
    order: {},
  }),
])(true)
