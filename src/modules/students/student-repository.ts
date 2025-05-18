import R from 'ramda'
import StudentDTO from './dto/student-dto'
import orm, { Student } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import { _create, _findOne, _findOneOrFail, _patch, _patchAll, DELETED_AT, _findOneInstanceOrFailWithoutDeleted, _findOneWithoutDeleted, _delete } from '../../../utils/generics/repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { DATETIME_DATABASE_FORMAT, PREVIEW_STUDENT_EMAIL } from '../../constants'
import { SaltyBucksOperationType } from '../salty-bucks-log/salty-bucks-operation-type'
import { StudentCourse } from '../../types/student-course'
import moment from 'moment'
import { logIncome } from '../salty-bucks-log/salty-bucks-log-service'
import { getSetting } from '../settings/settings-service'
import { Settings } from '../settings/settings'
import { SaltyBucksOperationSubtype } from '../salty-bucks-log/salty-bucks-operation-subtype'
import { SaltyBucksReferenceType } from '../salty-bucks-log/salty-bucks-reference-type'
import { customException, throwException } from '../../../utils/error/error-factory'
import createOnboardingTasks from '../student-tasks/actions/create-getting-started-tasks'
import { findOneOrFail as findAdmin } from '../admins/admin-repository'
import { int } from '@desmart/js-utils'

const { knex } = orm.bookshelf

const MODEL = Student
const MODEL_NAME = 'Student'

export const create = async (dto: StudentDTO) => {
  const student = await _create(MODEL)({
    ...dto,
    created_at: new Date(),
    video_bg_music_enabled: false,
  })

  await createOnboardingTasks(student.id)

  return student
}

export const update = async (id: string, dto: {}) => (
  _patch(MODEL)(id, dto)
)

export const upsert = async (dto: StudentDTO) => {
  const student = await findOneByEmail(dto.email)

  return R.ifElse(
    R.isNil,
    async () => {
      const student = await create(dto)

      await logIncome(student.id, await getSetting(Settings.SaltyBucksStartingBalance), SaltyBucksOperationSubtype.initialValue, student.id, SaltyBucksReferenceType.student)

      return student
    },
    async () => update(
      student.id,
      // R.omit(['salty_bucks_balance', 'email'])(dto) // the client disabled the option to update profile via token
      { username: student.username }
    )
  )(student)
}

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const findOneWithoutDeleted = async (where: object) => (
  _findOneWithoutDeleted(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

const countActiveProducts = (tableName: string) => (
  knex({ tbl: tableName })
    .select(knex.raw('coalesce(count(tbl.id), 0)::integer'))
    .whereRaw('tbl.student_id = s.id')
    .andWhereRaw('(tbl.accessible_to > NOW() or tbl.status = \'scheduled\')')
)

export const findStudents = async (query, filter) => {
  const search = R.prop('search', filter)

  return fetchRaw(
    MODEL,
    async (knex, pagination, order, count) => {
      let qb = knex({ s: 'students' })
        .whereNull(`s.${DELETED_AT}`)
        .andWhereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)

      qb = search
        ? qb.andWhereRaw(`(
      s.name ilike '%' || ? || '%'  
      or s.email ilike '%' || ? || '%'  
    )`, [search, search])
        : qb

      if (count) {
        // Filtering by course and it's details
        if (filter?.course_id) {
          qb = qb.leftJoin({ sc: 'student_courses' }, 'sc.student_id', 's.id')
            .where('sc.book_course_id', filter.course_id)

          if (filter.course_type) {
            qb = qb.andWhere('sc.type', filter.course_type)

            if (filter.end_date_id) {
              qb = qb.andWhere('sc.end_date_id', filter.end_date_id)
            }
          }
        }

        const count = await qb.count('s.id')

        const summed = R.pipe(
          R.pluck('count'),
          R.sum,
          R.objOf('count')
        )(count)

        return [summed]
      }

      const generateSubQuery = (operationType: SaltyBucksOperationType) => knex({ sbl: 'salty_bucks_logs' })
        .select(knex.raw('coalesce(sum(sbl.amount), 0)::integer'))
        .whereRaw('sbl.student_id = s.id')
        .andWhereRaw(`sbl.operation_type = '${operationType}'`)
        .andWhereRaw('sbl.created_at between now()::date - interval \'5 days\' and now()')

      const countProducts = (tableName: string) => (
        knex({ tbl: tableName })
          .select(knex.raw('coalesce(count(tbl.id), 0)::integer'))
          .whereRaw('tbl.student_id = s.id')
      )

      if (order.by) {
        qb = qb.orderByRaw(`${order.by} ${order.dir} NULLS LAST`)
      }

      // "distinct" must be first, it fails otherwise
      qb = qb.select(knex.raw('distinct s.*'))

      // Filtering by course and it's details
      if (filter?.course_id) {
        qb = qb.leftJoin({ sc: 'student_courses' }, 'sc.student_id', 's.id')
          .where('sc.book_course_id', filter.course_id)
          .select('sc.title', 'sc.accessed_at', 'sc.type', 'sc.end_date_id', 'sc.status')

        if (filter.course_type) {
          qb = qb.andWhere('sc.type', filter.course_type)

          if (filter.end_date_id) {
            qb = qb.leftJoin({ ced: 'course_end_dates' }, 'sc.end_date_id', 'ced.id')
              .andWhere('sc.end_date_id', filter.end_date_id)
              .select('ced.semester_name')
          }
        }
      }

      return qb
        .select([
          knex.raw(`(${generateSubQuery(SaltyBucksOperationType.income).toQuery()}) - (${generateSubQuery(SaltyBucksOperationType.outcome).toQuery()}) as recently_earning`),
          knex.raw(`(${countActiveProducts('student_exams').toQuery()}) + (${countActiveProducts('student_courses').toQuery()}) as active_products`),
          knex.raw(`(${countProducts('student_courses').toQuery()}) as active_courses`),
        ])
        .limit(pagination.take)
        .offset(pagination.take * (pagination.page - 1))
        // .debug(true)
    }
  )(query)
}

export const bulkSetIsActive = async (is_active, ids) => (
  _patchAll(MODEL)(ids, { is_active })
)

export const setIsActive = async (id: string, is_active: boolean) => (
  _patch(MODEL)(id, { is_active })
)

export const findOneByEmail = async (email: string) => R.pipeWith(R.andThen)([
  async () => findCustom(
    MODEL.whereRaw(`(email = ?) AND (${DELETED_AT} IS NULL)`, [email])
  )({ page: 1, take: 1 }, { by: 'email', dir: 'asc' }),
  R.prop('data'),
  collectionToJson,
  R.ifElse(
    R.isEmpty,
    R.always(undefined),
    R.head
  ),
])(true)

export const softDeleteByIds = async (command: { ids: string[] }) => {
  const result = await knex('students')
    .update({ [DELETED_AT]: knex.fn.now() })
    .whereIn('id', command.ids)
    .andWhere({ [DELETED_AT]: null })
    .returning('*')

  return result
}

export const deleteCompletely = async (id: string) => (
  _delete(MODEL)({ id })
)

export const checkIfActiveStudentExist = async (command: { id: string }) => {
  const result = await knex({ s: 'students' })
    .count('s.id')
    .where({ 's.id': command.id, 's.is_active': true })
    .first()

  return Boolean(parseInt(result.count as string, 10))
}

export const countActiveStudentsByIds = async (command: { ids: string[] }) => {
  const result = await knex('students')
    .whereIn('id', command.ids)
    .andWhere({ [DELETED_AT]: null })
    .count('id')
    .first()

  return parseInt(result.count as string, 10)
}

export const updateById = async (command: { id: string, data: any }) => {
  const result = await knex('students')
    .update(command.data)
    .where({ id: command.id })
    .returning('*')

  return R.head(result)
}

export const findOneInstance = async (where) => (
  _findOneInstanceOrFailWithoutDeleted(MODEL, MODEL_NAME)(where)
)

export const getSaltyBucksPercentileRank = async (studentCourse: StudentCourse) => (
  knex({ s: 'students' })
    .select(knex.raw('s.id, name, username, salty_bucks_balance, PERCENT_RANK() OVER (ORDER BY salty_bucks_balance) * 100 as percentile_rank'))
    .leftJoin({ sc: 'student_courses' }, 'sc.student_id', 's.id')
    .where({ 'sc.book_course_id': studentCourse.book_course_id })
    .groupByRaw('s.id, name, username, salty_bucks_balance')
    .orderBy('salty_bucks_balance', 'desc')
)

export const findStudentByPhoneNumber = async (phoneNumber: string) => (
  findOne({ phone_number: phoneNumber })
)

export const findStudentByPhoneNumberAndEmail = async (phoneNumber: string, email: string) => (
  findOneWithoutDeleted({ phone_number: phoneNumber, email })
)

export const findOneStudentByExternalId = async (external_id: number) => (
  findOne({ external_id, deleted_at: null })
)

export const setVerificationCode = async (studentId: string, code: string) => (
  patch(studentId, { verification_code: code, code_created_at: new Date() })
)

export const clearVerificationCode = async (studentId: string) => (
  patch(studentId, { verification_code: null, code_created_at: null })
)

export const updateCodeExpiresAt = async (studentId: string) => (
  patch(studentId, { code_expires_at: moment().add(30, 'minutes').format(DATETIME_DATABASE_FORMAT) })
)

export const setExternalId = async (studentId: string, external_id: number) => (
  patch(studentId, { external_id })
)

export const upsertByExternalId = async (external_id: number, email: string, name: string, phone_number: string) => {
  email = email.toLowerCase()
  const student = await findOneStudentByExternalId(external_id)
  const student2 = await findOne({ email, deleted_at: null })

  if (student2 && student?.id !== student2.id) {
    throwException(customException('students.email.already-exists', 403, 'Student with this email already exists'))
  }

  if (student) {
    await patch(student.id, { email, name, phone_number })
  } else {
    const salty_bucks_balance = await getSetting(Settings.SaltyBucksStartingBalance)
    const student = await create({ external_id, email, name, phone_number, salty_bucks_balance, is_student: true })
    await logIncome(student.id, salty_bucks_balance, SaltyBucksOperationSubtype.initialValue, student.id, SaltyBucksReferenceType.student)
  }
}

export const findOutdatedAccounts = async (pagination: { take: number, page: number }) => (
  knex({ s: 'students' })
    .select(knex.raw('distinct s.id'), 'email', 'logged_at')
    .leftJoin('student_courses as sc', 's.id', 'sc.student_id')
    .whereRaw('s.logged_at IS NOT NULL AND s.logged_at < now() - interval \'90 days\' and (sc.accessible_to is null or sc.accessible_to < now() - interval \'180 days\') and s.deleted_at is null and s.is_frozen = false') // student has not logged in for 180 days
    .orderBy('logged_at', 'desc')
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
)

export const findOutdatedNotUsedAccounts = async (pagination: { take: number, page: number }) => (
  knex({ s: 'students' })
    .select(knex.raw('distinct s.id'), 'email', 'logged_at')
    .leftJoin('student_courses as sc', 's.id', 'sc.student_id')
    .whereRaw('s.logged_at IS NULL AND s.created_at < now() - interval \'90 days\' and (sc.accessible_to is null or sc.accessible_to < now() - interval \'180 days\') and s.deleted_at is null and s.is_frozen = false') // student has not logged in for 180 days
    .orderBy('logged_at', 'desc')
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
)

export const findStudentsV3 = async (query, adminCourseIds: string[], adminId: string) => {
  const courseSubquery = `(
    select json_agg(row_to_json(courses))
    from (
      select distinct sc.id, sc.title, sc.accessed_at, ced.semester_name, sc.type, sc.end_date_id, sc.status
      from student_courses as sc
      left join course_end_dates ced on ced.id = sc.end_date_id
      where sc.student_id = s.id
      and sc.is_deleted = false
      ${adminCourseIds.length ? `and sc.book_course_id in (${adminCourseIds.map(id => `'${id}'`).join(',')})` : ''}
      ${query.filter?.type ? `and sc.type = '${query.filter.type}'` : ''}
      ${query.filter?.end_date_id ? `and sc.end_date_id = '${query.filter.end_date_id}'` : ''}
      ${query.filter?.course_id ? `and sc.book_course_id = '${query.filter.course_id}'` : ''}
      order by sc.title asc
    ) as courses
  ) as courses`

  const search = R.prop('search', query.filter)

  // Base query builder with common conditions
  const baseQuery = (qb) => {
    qb = qb.whereNull('s.deleted_at')
      .andWhereRaw('s.email not ilike ?', PREVIEW_STUDENT_EMAIL)

    if (search) {
      qb = qb.andWhereRaw(`(
        s.name ilike '%' || ? || '%'  
        or s.email ilike '%' || ? || '%'  
      )`, [search, search])
    }

    // Add course_id filter
    if (query.filter?.course_id) {
      qb = qb.leftJoin({ sc: 'student_courses' }, 'sc.student_id', 's.id')
        .where('sc.book_course_id', query.filter.course_id)

      // Add additional course filters
      if (query.filter.type) {
        qb = qb.andWhere('sc.type', query.filter.type)
      }
      if (query.filter.end_date_id) {
        qb = qb.andWhere('sc.end_date_id', query.filter.end_date_id)
      }
    }

    if (adminCourseIds.length) {
      if (!query.filter?.course_id) {
        qb = qb.leftJoin({ sc: 'student_courses' }, 'sc.student_id', 's.id')
      }
      qb = qb.leftJoin({ ac: 'admin_courses' }, 'ac.course_id', 'sc.book_course_id')
        .where('ac.admin_id', adminId)
        .whereIn('sc.book_course_id', adminCourseIds)
    }

    return qb
  }

  // Count query - now using a subquery to ensure accurate distinct counting with joins
  const countQuery = knex
    .select(knex.raw('count(distinct sub.id) as total'))
    .from(function () {
      const subQuery = this.select('s.id')
        .from({ s: 'students' })
      return baseQuery(subQuery).as('sub')
    })

  const [countResult, results] = await Promise.all([
    countQuery.first(),
    baseQuery(knex({ s: 'students' }))
      .select([
        's.*',
        knex.raw(courseSubquery),
        knex.raw(`(${countActiveProducts('student_exams').toQuery()}) + (${countActiveProducts('student_courses').toQuery()}) as active_products`),
      ])
      .groupBy('s.id')
      .orderByRaw(`${query.order?.by || 's.created_at'} ${query.order?.dir || 'desc'} NULLS LAST`)
      .limit(query.limit.take)
      .offset(query.limit.take * (query.limit.page - 1)),
  ])

  return {
    data: results,
    meta: {
      // @ts-ignore
      recordsTotal: int(countResult?.total ?? 0),
      // @ts-ignore
      pagesTotal: Math.ceil(int(countResult?.total ?? 0) / query.limit.take),
      page: query.limit.page,
      take: query.limit.take,
    },
  }
}
