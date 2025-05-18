import * as R from 'ramda'
import orm, { StudentExam } from '../../models'
import StudentExamDTO from './dto/student-exam-dto'
import {
  _create,
  _findOne,
  _findOneOrFail,
  _patch,
  _deleteAll,
  _patchCustom,
  DELETED_AT
} from '../../../utils/generics/repository'
import { fetch, fetchCustom, fetchRaw, FetchRawCommand, Order, Pagination } from '../../../utils/model/fetch'
import { STUDENT_EXAM_STATUS_SCHEDULED, STUDENT_EXAM_STATUS_EXPIRED, STUDENT_EXAM_STATUS_COMPLETED, STUDENT_EXAM_STATUS_PAUSED, STUDENT_EXAM_STATUS_IN_PROGRESS, STUDENT_EXAM_STATUS_ARCHIVED } from './student-exam-statuses'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import moment, { duration } from 'moment'
import { Knex } from 'knex'
import { AttachedExamTypeEnum } from '../attached-exams/attached-exam-types'
import { PREVIEW_STUDENT_EMAIL } from '../../constants'
import { STUDENT_EXAM_SCORE_STATUS_CALCULATED } from './student-exam-score-statuses'
import { int } from '../../../utils/number/int'

interface BuildQueryCommand {
  studentId: string
  skipPreviewStudent: boolean
  search?: string
  examType?: string
  includeCourse?: boolean
  chapterId?: string
  bookId?: string
  studentCourseId?: string
  typeLabel?: string
  duration?: string
}

type FindExamsQuery = FetchRawCommand & { [key: string]: unknown }

type FilterByAttachedItemCommand = Pick<BuildQueryCommand, 'includeCourse' | 'chapterId' | 'bookId'> & { qb: Knex.QueryBuilder }

type CountResultsCommand = Pick<BuildQueryCommand, 'studentId' | 'search' | 'examType' | 'studentCourseId'> & { knex: Knex }

const { knex } = orm.bookshelf

const MODEL = StudentExam
const MODEL_NAME = 'StudentExam'

export const create = async (dto: StudentExamDTO) => (
  _create(MODEL)(dto)
)

export const find = async (query: { limit: { take: number, page: number }, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order }, true)
)

export const findCustomWithPagination = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const findOne = async (where: object, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const patchCustom = (qb: any) => async (data: object) => (
  _patchCustom(qb)(data)
)

export const reset = async (id: string) => (
  _patch(MODEL)(id, {
    accessible_from: null,
    accessible_to: null,
    status: STUDENT_EXAM_STATUS_SCHEDULED,
    exam_seconds_left: null,
    current_page: null,
    completed_at: null,
    completed_as: null,
  })
)

export const resetForRetake = async (id: string) => (
  _patch(MODEL)(id, {
    exam_seconds_left: null,
    current_page: null,
    completed_at: null,
    scores: null,
  })
)

export const patchWhereExternalIdAndExternalCreatedAt = (externalCreatedAt: string, externalId: string, studentId: string) => async (data: object) => (
  patchCustom(
    MODEL.where({
      external_id: externalId,
      student_id: studentId,
    })// .andWhere('external_created_at', '<', externalCreatedAt)
  )(data)
)

export const fetchExistingExamsCount = (externalCreatedAt: string, externalId: string, studentId: string) => (
  MODEL.where({
    external_id: externalId,
    student_id: studentId,
  }).andWhere('external_created_at', '>=', externalCreatedAt)
    .andWhereRaw('deleted_at IS NULL')
    .count()
)

export const countCompletedExamsWithType = async (exam_type_id: string): Promise<any> => (
  MODEL.where({
    exam_type_id,
  }).andWhereRaw('completed_at IS NOT NULL')
    .andWhereRaw('deleted_at IS NULL')
    .count()
)

export const countCompletedExams = async (student_id: string, exam_type_id: string): Promise<any> => (
  MODEL.where({
    exam_type_id,
    student_id,
  }).andWhereRaw('completed_at IS NOT NULL')
    .andWhereRaw('deleted_at IS NULL')
    .count()
)

export const findExamsForGraph = exam_type_id => async student_id => (
  findCustom(
    MODEL.where({
      student_id,
      exam_type_id,
    }).andWhereRaw('completed_at IS NOT NULL')
      .andWhereRaw('deleted_at IS NULL')
  )({ page: 1, take: 100 }, { by: 'completed_as', dir: 'asc' }, ['sections'])
)

const findCompletedExams = (examTypeId, limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated: string[] = []) => async student => (
  findCustomWithPagination(
    MODEL.where({
      exam_type_id: examTypeId,
      student_id: student.id,
    }).andWhereRaw('completed_at IS NOT NULL')
      .andWhereRaw('deleted_at IS NULL')
  )(limit, order, withRelated)
)

const findCompletedExamsAllStudents = async (examTypeId, limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated: string[] = []) => (
  findCustom(
    MODEL.where({
      exam_type_id: examTypeId,
    }).andWhereRaw('completed_at IS NOT NULL')
  )(limit, order, withRelated)
)

export const findAllCompletedExams = (examTypeId) => async student => (
  R.pipeWith(R.andThen)([
    findCompletedExams(
      examTypeId,
      {
        page: 1,
        take: 100,
      },
      {
        by: 'completed_at',
        dir: 'desc',
      }
    ),
    R.prop('data'),
    collectionToJson,
  ])(student)
)

export const findAllCompletedExamsAllStudents = async ({ id }) => (
  R.pipeWith(R.andThen)([
    async examTypeId => findCompletedExamsAllStudents(
      examTypeId,
      {
        page: 1,
        take: 20,
      },
      {
        by: 'completed_at',
        dir: 'desc',
      },
      ['sections.passages.questions']
    ),
    R.prop('data'),
    collectionToJson,
  ])(id)
)

export const findAllExams = async (where: object, withRelated: string[] = []) => (
  find(
    {
      limit: {
        page: 1,
        take: 100,
      },
      order: {
        by: 'create_at',
        order: 'asc',
      },
    },
    where,
    withRelated
  )
)

const findExamsForPTS = (examNumber, examTypeId) => async () => (
  find(
    {
      limit: {
        take: 20,
        page: 1,
      },
      order: {
        by: 'completed_at',
        dir: 'desc',
      },
    },
    {
      is_intact: true,
      completed_as: examNumber,
      exam_type_id: examTypeId,
    }
  )
)

export const findExamsForInitialPTSCalculation = async (examNumber, examTypeId) => (
  R.pipeWith(R.andThen)([
    findExamsForPTS(examNumber, examTypeId),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const fetchStudentExamsWithIds = async ids => (
  R.pipeWith(R.andThen)([
    // @ts-ignore
    findCustom(
      MODEL.whereIn('id', ids)
    ),
    R.prop('data'),
    collectionToJson,
    // @ts-ignore
  ])(undefined, { by: 'id', dir: 'asc' }, ['sections.passages.questions'])
)

export const getUniqueStudentExamTypes = async studentId => (
  fetchCustom(
    MODEL.where({
      student_id: studentId,
    }).query({
      distinct: 'exam_type_id',
      groupBy: 'exam_type_id',
    })
  )(['type'], undefined, true)
)

export const fetchRandomStudentExam = async (studentId, examTypeId) => (
  findOne(
    {
      student_id: studentId,
      exam_type_id: examTypeId,
    },
    ['sections', 'type.scaledScoreDefinitions.template.scores']
  )
)

export const expireExam = async id => (
  patch(id, {
    status: STUDENT_EXAM_STATUS_EXPIRED,
  })
)

export const dropExamsWithIds = async (ids: string[]) => (
  _deleteAll(MODEL)(ids)
)

const twoDaysFromNow = () => moment().add(2, 'days').format('YYYY-MM-DD')
const today = () => moment().format('YYYY-MM-DD')

export const findExamsToExpireInTwoDays = async () => (
  findCustom(
    MODEL.whereRaw('accessible_to::text like ? || \'%\'', twoDaysFromNow())
  )(undefined, { by: 'created_at', dir: 'desc' }, ['student'])
)

export const findExamsToExpireToday = async () => (
  findCustom(
    MODEL.whereRaw('accessible_to::text like ? || \'%\'', today())
  )(undefined, { by: 'created_at', dir: 'desc' }, ['student'])
)

export const findFullExamsToExpireInTwoDays = async () => (
  findCustom(
    MODEL.whereRaw(`accessible_to::text like ? || '%'
      and 'full' in (select et.type from exam_types as et where et.id = exam_type_id)`, twoDaysFromNow())
  )(undefined, { by: 'created_at', dir: 'desc' }, ['student', 'type'])
)

export const findFullExamsToExpireToday = async () => (
  findCustom(
    MODEL.whereRaw(`accessible_to::text like ? || '%'
      and 'full' in (select et.type from exam_types as et where et.id = exam_type_id)`, today())
  )(undefined, { by: 'created_at', dir: 'desc' }, ['student', 'type'])
)

const countResults = async (command: CountResultsCommand) => {
  let qb

  if (command.studentCourseId) {
    qb = command.knex
      .select(
        'se.id',
        'et.*'
      ).from('student_exams AS se')
      .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
      .leftJoin('students AS s', 's.id', 'se.student_id')
      .leftJoin('student_courses AS sc', 'sc.student_id', 'se.student_id')
      .leftJoin('student_attached_exams AS sae', 'sae.exam_id', 'se.id')
      .whereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)
      .whereRaw(`(
        se.title ilike '%' || ? || '%'
        or et.type ilike '%' || ? || '%' 
      )`, [command.search, command.search])
      .where({ 'se.student_id': command.studentId })
      .where({ 'se.deleted_at': null })
      .where({ 'sc.id': command.studentCourseId })
      .groupByRaw('se.id, et.id')
      .countDistinct('se.id')
  } else {
    qb = command.knex
      .select(
        'se.id',
        'et.*'
      ).from('student_exams AS se')
      .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
      .leftJoin('students AS s', 's.id', 'se.student_id')
      .whereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)
      .whereRaw(`(
        se.title ilike '%' || ? || '%'
        or et.type ilike '%' || ? || '%' 
      )`, [command.search, command.search])
      .where({ 'se.student_id': command.studentId })
      .where({ 'se.deleted_at': null })
      .whereRaw(`
          se.id not in (
            select se.id from student_exams se 
            right join student_attached_exams sae on (sae.exam_id = se.id)
            where se.student_id = ?
          )
        `, [command.studentId])
      .groupByRaw('se.id, et.id')
      .countDistinct('se.id')
  }

  if (command.examType) {
    qb = qb.andWhere('et.type', command.examType)
  }

  qb = filterByAttachedItem({ ...command, qb })

  return qb
}

const countStudentFetchResults = async (knex, search, examTypeId) => {
  const qb = knex.from('student_exams AS se')
    .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
    .innerJoin('students AS s', join => {
      join.on('s.id', 'se.student_id')
        .andOnNull(`s.${DELETED_AT}`)
    })
    .andWhereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)
    .andWhereRaw(`(
    s.name ilike '%' || ? || '%' 
    or s.email ilike '%' || ? || '%'
  )`, [search, search])

  if (examTypeId) {
    qb.andWhere('se.exam_type_id', examTypeId)
  }

  return qb.countDistinct('se.id')
}

const filterByAttachedItem = (command: FilterByAttachedItemCommand) => {
  const shouldAddInnerJoin = command.includeCourse || command.chapterId || command.bookId

  if (!shouldAddInnerJoin) {
    return command.qb
  }

  let { qb } = command

  if (command.chapterId) {
    qb = qb
      .whereRaw('(sae.original_attached_id = ? and sae.type = ?)', [
        command.chapterId,
        AttachedExamTypeEnum.chapter,
      ])
  } else if (command.bookId) {
    qb = qb
      // .leftJoin({ bc: 'book_chapters' }, 'bc.id', 'sae.original_attached_id')
      .whereRaw(`(
        (sae.original_attached_id = ? and sae.type = ?)
        or (bc.book_id = ? and sae.type = ?)
      )`, [
        command.bookId,
        AttachedExamTypeEnum.book,
        command.bookId,
        AttachedExamTypeEnum.chapter,
      ])
  } else if (command.includeCourse) { // fixme: change for courseID
    qb = qb
      .leftJoin({ bc: 'courses' }, 'bc.title', (knex as any).raw('?', ['default']))
      .leftJoin({ cb: 'course_books' }, 'bc.id', 'cb.course_id')
      .leftJoin({ b: 'books' }, 'b.id', 'cb.book_id')
      .leftJoin({ bch: 'book_chapters' }, 'bch.book_id', 'b.id')
      .innerJoin({ ae: 'attached_exams' }, join => {
        join.on('se.exam_id', 'ae.exam_id')
          .andOn(join => {
            join
              .on((knex as any).raw('(ae.type = ? AND ae.attached_id IN (bc.id))', [AttachedExamTypeEnum.course]))
              .orOn((knex as any).raw('(ae.type = ? AND ae.attached_id IN (b.id))', [AttachedExamTypeEnum.book]))
              .orOn((knex as any).raw('(ae.type = ? AND ae.attached_id IN (bch.id))', [AttachedExamTypeEnum.chapter]))
          })
      })
  }

  return qb
}

const buildQuery = (command: BuildQueryCommand, asAdmin = false) =>
  async (knex: Knex, pagination: Pagination, order: Partial<Order>, count = false) => {
    let qb

    /**
     * This should be refactored...
     *
     * If the query is is "asAdmin" mode, take all exams (all courses + standalone)
     * If there is a course ID, take all exams (in given course + standalone)
     * If not - fetch ONLY standalone exams
     */
    if (asAdmin) {
      qb = knex
        .from('student_exams AS se')
        .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
        .leftJoin('student_attached_exams AS sae', 'sae.exam_id', 'se.id')
        .leftJoin('student_courses AS sc', 'sc.id', 'sae.course_id')
        .leftJoin('exams AS e', 'e.id', 'se.exam_id')
        .where({ 'se.student_id': command.studentId })
        .where({ 'se.deleted_at': null })
        .whereRaw('(sc.is_deleted = false or sc.id is null)')
    } else {
      if (command.studentCourseId) {
        qb = knex
          .from('student_exams AS se')
          .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
          .leftJoin('student_attached_exams AS sae', 'sae.exam_id', 'se.id')
          .leftJoin('book_chapters AS bc', 'sae.original_attached_id', 'bc.id')
          .leftJoin('student_courses AS sc', 'sc.id', 'sae.course_id')
          .leftJoin('exams AS e', 'e.id', 'se.exam_id')
          .where({ 'se.student_id': command.studentId })
          .where({ 'se.deleted_at': null })
          .whereRaw(`((sc.id = '${command.studentCourseId}' and sc.is_deleted = false) or sae.course_id is null)`)
      } else {
        qb = knex
          .from('student_exams AS se')
          .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
          .leftJoin('students AS s', 's.id', 'se.student_id')
          .leftJoin('exams AS e', 'e.id', 'se.exam_id')
          .where({ 'se.student_id': command.studentId })
          .where({ 'se.deleted_at': null })
          .whereRaw(`
            se.id not in (
              select se.id from student_exams se 
              right join student_attached_exams sae on (sae.exam_id = se.id)
              where se.student_id = ?
            )
          `, [command.studentId])
      }
    }

    if (command.search) {
      qb = qb.andWhereRaw(`(
      se.title ilike '%' || ? || '%' 
      or et.type ilike '%' || ? || '%'
    )`, [command.search, command.search])
    }

    if (command.examType) {
      qb = qb.andWhere('et.type', command.examType)
    }

    if (command.typeLabel) {
      qb = qb.andWhere('et.type_label', command.typeLabel)
    }

    if (command.duration) {
      if (command.duration === 'section') {
        qb = qb.andWhereRaw('((se.exam_length::jsonb->\'summary\'->\'minutes\')::integer in (90, 95))')
      } else if (command.duration === 'chapter') {
        qb = qb.andWhereRaw('((se.exam_length::jsonb->\'summary\'->\'minutes\')::integer = 30)')
      } else if (command.duration === 'full_length') {
        qb = qb.andWhereRaw('((se.exam_length::jsonb->\'summary\'->\'minutes\')::integer = 375)')
      } else if (command.duration === 'other') {
        qb = qb.andWhereRaw('((se.exam_length::jsonb->\'summary\'->\'minutes\')::integer not in (30, 90, 95, 375))')
      }
    }

    qb = filterByAttachedItem({ ...command, qb })

    if (count) {
      return qb.countDistinct('se.id')
    }

    if (order?.by) {
      if (order.by === 'duration') {
        qb = qb.orderByRaw(`(se.exam_length::jsonb->'summary'->'minutes')::integer ${order.dir ?? 'asc'} NULLS LAST`)
      } else if (order?.by === 'status') {
        if (order?.dir === 'asc') {
          qb = qb.orderByRaw(`status_sort ${order.dir}`)
            .orderByRaw(`is_free_trial_global ${order.dir}`)
            .orderByRaw('title_prefix_sort')
            .orderByRaw('title_number_sort nulls first')
            .orderByRaw('title_sort')
        } else {
          qb = qb.orderByRaw(`is_free_trial_global ${order.dir}`)
            // .orderByRaw(`status_order ${order.dir === 'asc' ? 'desc' : 'asc'}`)
            .orderByRaw('se.title asc')
        }
      } else {
        qb = qb.orderByRaw(`${order.by} ${order.dir ?? 'asc'} NULLS LAST`)
      }
    }

    if (asAdmin) {
      qb = qb
        .select(
          knex.raw('distinct(se.*)'),
          knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration"),
          'et.title as type_title',
          'et.type as type_type',
          'et.subtype as type_subtype',
          'sc.subtitle',
          'sc.title as course_title',
          'sc.id as student_course_id',
          'e.score_calculation_method'
        )
    } else {
      if (command.studentCourseId) {
        qb = qb
          .select(
            knex.raw(`distinct se.*, se.status, se.title, case se.status
              when '${STUDENT_EXAM_STATUS_COMPLETED}' then 1
              when '${STUDENT_EXAM_STATUS_PAUSED}' then 2
              when '${STUDENT_EXAM_STATUS_IN_PROGRESS}' then 3
              when '${STUDENT_EXAM_STATUS_SCHEDULED}' then 4
              when '${STUDENT_EXAM_STATUS_EXPIRED}' then 5
              when '${STUDENT_EXAM_STATUS_ARCHIVED}' then 6
              else 7
            end as status_sort`),
            knex.raw('sae.type as attached_type'),
            knex.raw('sae.original_attached_id'),
            knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration"),
            knex.raw(`case se.is_free_trial
              when sae.id is not null then true
              else se.is_free_trial
            end as is_free_trial_global`),
            knex.raw(`case sc.type = 'free_trial'
              when (sae.id is not null and bc.order = 1) then true
              else false
            end as is_free_trial_chapter
            `),
            'et.title as type_title',
            'et.type as type_type',
            'et.type_label',
            'et.subtype as type_subtype',
            'e.score_calculation_method',
            'se.title as exam_title',
            knex.raw(`CASE WHEN se.status = '${STUDENT_EXAM_STATUS_SCHEDULED}' THEN 1 ELSE 2 END as status_order`),
            knex.raw('substring(se.title, \'^\\D*\') collate "C" as title_prefix_sort'),
            knex.raw('substring(se.title, \'\\d+\')::bigint as title_number_sort'),
            knex.raw('se.title collate "C" as title_sort')
          )
          // .debug(true)
      } else {
        qb = qb
          .select(
            // knex.raw('distinct(se.*)'),
            knex.raw('se.*, se.status as status_sort'),
            knex.raw('substring(se.title, \'^\\D*\') collate "C" as title_prefix_sort'),
            knex.raw('substring(se.title, \'\\d+\')::bigint as title_number_sort'),
            knex.raw('se.title collate "C" as title_sort'),
            knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration"),
            knex.raw('false as is_free_trial_global'),
            'et.title as type_title',
            'et.type as type_type',
            'et.type_label',
            'et.subtype as type_subtype',
            'e.score_calculation_method',
            knex.raw(`CASE WHEN se.status = '${STUDENT_EXAM_STATUS_SCHEDULED}' THEN 1 ELSE 2 END as status_order`)
          )
      }
    }

    qb = qb
      .limit(pagination.take)
      .offset(pagination.take * (pagination.page - 1))

    return command.skipPreviewStudent ? qb.whereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL) : qb
  }

export const findExams = async (studentId: string, query: FindExamsQuery, filter?: Record<string, string>, skipPreviewStudent = true, studentCourseId = undefined, asAdmin = false) => {
  const search = R.propOr('', 'search')<Record<string, string>, string>(filter)

  return fetchRaw(
    MODEL,
    buildQuery({
      studentId,
      search,
      skipPreviewStudent,
      examType: filter?.exam_type,
      includeCourse: filter?.include_course === 'true' || filter?.include_course === '1',
      chapterId: filter?.chapter_id,
      bookId: filter?.book_id,
      studentCourseId,
      typeLabel: filter?.type_label,
      duration: filter?.duration,
    }, asAdmin)
  )(query)
}

const buildStudentFetchQuery = (search, examTypeId) => async (knex, pagination, order, count = false) => {
  const qb = knex
    .select(
      'se.*',
      'et.title as type_title',
      'et.type as type_type',
      'et.subtype as type_subtype',
      's.name',
      's.email',
      's.phone_number',
      's.is_active'
    ).from('student_exams AS se')
    .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
    .innerJoin('students AS s', join => {
      join.on('s.id', 'se.student_id')
        .andOnNull(`s.${DELETED_AT}`)
    })
    .andWhereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)
    .andWhereRaw(`(
      s.name ilike '%' || ? || '%' 
      or s.email ilike '%' || ? || '%'
    )`, [search, search])

  if (examTypeId) {
    qb.andWhere('se.exam_type_id', examTypeId)
  }

  qb.limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .orderByRaw(`${order.by} ${order.dir} NULLS LAST`)

  if (count) {
    const count = await countStudentFetchResults(knex, search, examTypeId)

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return qb
}

export const findExamsForAllStudents = async (query, filter) => {
  const search = R.propOr('', 'search')(filter)
  const examTypeId = R.prop('exam_type_id')(filter)

  return fetchRaw(
    MODEL,
    buildStudentFetchQuery(search, examTypeId)
  )(query)
}

export const fetchMostRecentlyCompletedFullMcat = async (studentId, courseId) => R.pipeWith(R.andThen)([
  async () => (
    knex('student_exams as se')
      .leftJoin('student_attached_exams as sae', 'sae.exam_id', 'se.id')
      .leftJoin('exam_types as et', 'se.exam_type_id', 'et.id')
      .select('se.*')
      .where('se.student_id', studentId)
      .where('sae.course_id', courseId)
      .where('et.type', 'full')
      .where('et.subtype', 'mcat')
      .where('se.scores_status', STUDENT_EXAM_SCORE_STATUS_CALCULATED)
      .orderBy('se.completed_at', 'desc')
      .limit(1)
  ),
  R.head,
])(true)

export const fetchCourseAttachedToExam = async (examId) => knex.raw(`
  SELECT *
  FROM student_courses
  WHERE id IN (
    SELECT course_id AS id
    FROM student_attached_exams
    WHERE exam_id = '${examId}')
`)

const fromExamsAndWithQuestions = () => (
  knex
    .from({ se: 'student_exams' })
    .leftJoin({ ses: 'student_exam_sections' }, 'se.id', 'ses.student_exam_id')
    .leftJoin({ sep: 'student_exam_passages' }, 'ses.id', 'sep.student_section_id')
    .leftJoin({ seq: 'student_exam_questions' }, 'sep.id', 'seq.student_passage_id')
)

export const countQuestions = async (examId: string) => (
  R.pipeWith(R.andThen)([
    async () => fromExamsAndWithQuestions()
      .where({ 'se.id': examId })
      .whereNotNull('seq.id')
      .countDistinct('seq.id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const countCorrectlyAnsweredQuestions = async (examId: string) => (
  R.pipeWith(R.andThen)([
    async () => fromExamsAndWithQuestions()
      .where({ 'se.id': examId })
      .whereRaw('seq.correct_answer = seq.answer')
      .whereNotNull('seq.id')
      .countDistinct('seq.id'),
    R.head,
    R.prop('count'),
    int,
  ])(true)
)

export const findExpiredAndOutdatedExams = (nDays: number) => async () => (
  findCustom(
    MODEL.whereRaw(`accessible_to < current_date - interval '${nDays} days'
      and status = '${STUDENT_EXAM_STATUS_EXPIRED}'`)
  )({ page: 1, take: 5 }, { by: 'accessible_to', dir: 'asc' })
)

export const findFreeTrialExams = async (studentCourseId: string) => {
  const freeTrialChapterCase = knex.raw(`
    CASE sc.type = 'free_trial'
      WHEN (sae.id is not null and bc.order = 1) THEN true
      ELSE se.is_free_trial
    END as is_free_trial_chapter
  `)

  const freeTrialCourseSubquery = knex.raw(`
    (
      select bool_or(ae.is_free_trial)
      from attached_exams ae
      left join exams e on e.id = ae.exam_id 
      left join student_exams se2 on se2.exam_id = e.id
      where se2.id = se.id
      and ae.type = 'course'
      and ae.attached_id = sc.book_course_id
    ) as is_free_trial_course
  `)

  return knex
    .select('se.id', 'se.exam_id', 'se.title')
    .select(freeTrialChapterCase)
    .select(freeTrialCourseSubquery)
    .from('student_attached_exams as sae')
    .leftJoin('book_chapters as bc', 'sae.original_attached_id', 'bc.id')
    .leftJoin('student_exams as se', 'se.id', 'sae.exam_id')
    .leftJoin('student_courses as sc', 'sc.id', 'sae.course_id')
    .where('sc.id', studentCourseId)
    .andWhere(function () {
      this.where(knex.raw(`
        CASE sc.type = 'free_trial'
          WHEN (sae.id is not null and bc.order = 1) THEN true
          ELSE se.is_free_trial
        END = true
      `))
        .orWhere(knex.raw(`
        (
          select bool_or(ae.is_free_trial)
          from attached_exams ae
          left join exams e on e.id = ae.exam_id 
          left join student_exams se2 on se2.exam_id = e.id
          where se2.id = se.id
          and ae.type = 'course'
          and ae.attached_id = sc.book_course_id
        ) = true
      `))
    })
}

export const findFirstChapterFreeTrialExams = async (studentCourseId: string) => {
  return knex
    .select(
      'se.*',
      knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration"),
      'et.title as type_title',
      'et.type as type_type',
      'et.type_label',
      'et.subtype as type_subtype',
      'sc.subtitle',
      'sc.title as course_title',
      knex.raw('sae.type as attached_type'),
      knex.raw('sae.original_attached_id'),
      knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration")
    )
    .from('student_attached_exams as sae')
    .leftJoin('book_chapters as bc', 'sae.original_attached_id', 'bc.id')
    .leftJoin('student_exams as se', 'se.id', 'sae.exam_id')
    .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
    .leftJoin('student_courses as sc', 'sc.id', 'sae.course_id')
    .leftJoin('books as b', 'b.id', 'bc.book_id')
    .leftJoin('course_books as cb', function () {
      this.on('cb.book_id', '=', 'b.id')
        .andOn('cb.course_id', '=', 'sc.book_course_id')
    })
    .where('sc.id', studentCourseId)
    .where('bc.order', 1)
    .where('cb.is_free_trial', true)
}

export const findCourseAttachedFreeTrialExams = async (studentCourseId: string) => {
  return knex
    .select(
      'se.*',
      knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration"),
      'et.title as type_title',
      'et.type as type_type',
      'et.type_label',
      'et.subtype as type_subtype',
      'sc.subtitle',
      'sc.title as course_title',
      knex.raw('sae.type as attached_type'),
      knex.raw('sae.original_attached_id'),
      knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration")
    )
    .from('student_exams as se')
    .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
    .leftJoin('student_attached_exams as sae', 'sae.exam_id', 'se.id')
    .leftJoin('attached_exams as ae', 'ae.exam_id', 'se.exam_id')
    .leftJoin('student_courses as sc', 'sc.id', 'sae.course_id')
    .where('sae.course_id', studentCourseId)
    .where('ae.type', 'course')
    .where('ae.is_free_trial', true)
    .groupByRaw('se.id, et.title, et.type, et.type_label, et.subtype, sc.subtitle, sc.title, sae.type, sae.original_attached_id')
}

export const findBookAttachedFreeTrialExams = async (studentCourseId: string) => {
  return knex
    .select(
      'se.*',
      knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration"),
      'et.title as type_title',
      'et.type as type_type',
      'et.type_label',
      'et.subtype as type_subtype',
      'sc.subtitle',
      'sc.title as course_title',
      knex.raw('sae.type as attached_type'),
      knex.raw('sae.original_attached_id'),
      knex.raw("(se.exam_length::jsonb->'summary'->'minutes')::integer as duration")
    )
    .from('student_exams as se')
    .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
    .leftJoin('student_attached_exams as sae', 'sae.exam_id', 'se.id')
    .leftJoin('attached_exams as ae', 'ae.exam_id', 'se.exam_id')
    .leftJoin('student_courses as sc', 'sc.id', 'sae.course_id')
    .leftJoin('student_books as sb', 'sb.course_id', 'sc.id')
    .leftJoin('course_books as cb', function () {
      this.on('cb.book_id', '=', 'sb.book_id')
        .andOn('cb.course_id', '=', 'sc.book_course_id')
    })
    .where('sae.course_id', studentCourseId)
    .where('ae.type', 'book')
    .where('ae.attached_id', knex.ref('sb.book_id'))
    .where('cb.is_free_trial', true)
}
