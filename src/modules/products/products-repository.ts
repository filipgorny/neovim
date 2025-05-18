/* eslint-disable @typescript-eslint/no-floating-promises */
import { DELETED_AT, int } from '@desmart/js-utils'
import moment from 'moment'
import * as R from 'ramda'
import { PREVIEW_STUDENT_EMAIL } from '../../constants'
import orm from '../../models'

const knex = orm.bookshelf.knex

type Query = {
  limit?: {
    page?: number,
    take?: number
  },
  filter?: {
    product_type?: 'course' | 'exam',
  },
  order: {
    by: string,
    dir: 'asc' | 'desc',
  },
}

const getLimitFromQuery = (query: Query) => (
  R.pathOr(10, ['limit', 'take'], query)
)

const getOffsetFromQuery = (query: Query) => (
  (R.pathOr(1, ['limit', 'page'], query) - 1) * getLimitFromQuery(query)
)

const courseQueryPart = (filter?: string) => (
  (!filter || filter === 'course')
    ? knex({ c: 'courses' })
      .select('id', 'title', 'external_id', knex.raw('\'course\' as product_type'))
      .whereNull('deleted_at')
    : knex({ c: 'courses' })
      .select('id', 'title', 'external_id', knex.raw('\'course\' as product_type'))
      .whereNull('id')
)

const examQueryPart = (filter?: string) => (
  (!filter || filter === 'exam')
    ? knex({ e: 'exams' })
      .select('id', 'title', 'external_id', knex.raw('\'exam\' as product_type'))
      .whereNull('deleted_at')
    : knex({ e: 'exams' })
      .select('id', 'title', 'external_id', knex.raw('\'exam\' as product_type'))
      .whereNull('id')
)

const countQueryPart = async (qb, column = 'id') => (
  R.pipeWith(R.andThen)([
    async () => qb.clearSelect().count(column),
    R.head,
    R.values,
    R.head,
    int,
  ])(true)
)

const currentPageFromQuery = (query: Query) => (
  {
    page: int(R.pathOr(1, ['limit', 'page'], query)),
    take: int(R.pathOr(10, ['limit', 'take'], query)),
  }
)

const getProductTypeFilter = (query: Query) => (
  R.pathOr(null, ['filter', 'product_type'], query)
)

export const getProducts = async (query: Query) => {
  const filter = getProductTypeFilter(query)
  const qb = knex
    .union(
      courseQueryPart(filter)
    ).union(
      examQueryPart(filter)
    ).orderBy(query.order.by, query.order.dir)

  const [courseTotalCount, examTotalCount] = await Promise.all([
    countQueryPart(courseQueryPart(filter)),
    countQueryPart(examQueryPart(filter)),
  ])

  const results = await qb
    .limit(getLimitFromQuery(query))
    .offset(getOffsetFromQuery(query))

  const recordsTotal = courseTotalCount + examTotalCount

  return {
    data: results,
    meta: {
      recordsTotal,
      pagesTotal: Math.ceil(recordsTotal / getLimitFromQuery(query)),
      ...currentPageFromQuery(query),
    },
  }
}

const studentCourseQueryPart = (search?, filter?) => {
  const qb = knex({ sc: 'student_courses' })
    .select(
      'sc.id',
      'sc.status',
      'sc.accessible_to',
      'sc.type',
      'sc.is_paused',
      's.name',
      's.email',
      's.salty_bucks_balance',
      's.is_active',
      's.id',
      knex.raw('sc.title as course'),
      knex.raw('case when sc."type" = \'live_course\' then ced.end_date::text else sc."type" end as "class"'),
      knex.raw('\'courses\' as source'),
      knex.raw(`
        case
          when (sc.accessible_to is null or sc.accessible_to > NOW()) and (sc.status = 'scheduled' or sc.status = 'ongoing') and not sc.is_paused then 2
          when (sc.accessible_to is null or sc.accessible_to > NOW()) and sc.is_paused then 1
          else 0
        end as active_products`
      )
    )
    .leftJoin('students as s', 's.id', 'sc.student_id')
    .leftJoin('course_end_dates as ced', 'ced.id', 'sc.end_date_id')
    .whereNull(`s.${DELETED_AT}`)
    .andWhereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)

  if (search) {
    qb.andWhereRaw('(s.name ilike \'%\' || ? || \'%\' or s.email ilike \'%\' || ? || \'%\' or sc.title ilike \'%\' || ? || \'%\')', [search, search, search])
  }

  if (filter?.course_id) {
    qb.andWhere('sc.book_course_id', filter.course_id)
  }

  if (filter?.end_date_id) {
    qb.andWhere('sc.end_date_id', filter.end_date_id)
  }

  return qb
}

const studentExamQueryPart = (search?) => {
  const qb = knex({ se: 'student_exams' })
    .select(
      'se.id',
      'se.status',
      'se.accessible_to',
      knex.raw('null as type'),
      knex.raw('((se.accessible_to is null or se.accessible_to > NOW()) and se.status = \'paused\') as is_paused'),
      's.name',
      's.email',
      's.salty_bucks_balance',
      's.is_active',
      's.id',
      knex.raw('null as course'),
      knex.raw('se.title as "class"'),
      knex.raw('\'exams\' as source'),
      knex.raw(`
        case
          when ((se.accessible_to is null or se.accessible_to > NOW()) and (se.status = 'scheduled' or se.status = 'in_progress')) or se.status = 'completed' then 2
          when (se.accessible_to is null or se.accessible_to > NOW()) and se.status = 'paused' then 1
          else 0 
        end as active_products`
      )
    )
    .leftJoin('students as s', 's.id', 'se.student_id')
    .whereNull(`s.${DELETED_AT}`)
    .andWhereRaw('(s.email not ilike ?)', PREVIEW_STUDENT_EMAIL)

  if (search) {
    qb.andWhereRaw('(s.name ilike \'%\' || ? || \'%\' or s.email ilike \'%\' || ? || \'%\')', [search, search])
  }

  return qb
}

const adjustDates = (results) => (
  R.map(item => (
    R.evolve({
      accessible_to: (date) => date ? moment(date).format('MM/DD/YYYY') : null,
      class: (date) => (date && item.type === 'live_course') ? moment(date).format('MM/DD/YYYY') : date,
    })(item)
  ))(results)
)

const transformResults = (results) => (
  adjustDates(results)
)

const getExamTotalCount = (filter, count) => (
  (filter?.course_id || filter?.end_date_id) ? 0 : count
)

export const findProductsWithStudents = async (query, filter) => {
  const search = R.prop('search', filter)

  const qb = knex
    .union(studentCourseQueryPart(search, filter))

  if (!filter?.course_id && !filter?.end_date_id) {
    qb.union(studentExamQueryPart(search))
  }

  qb.orderBy(query.order.by, query.order.dir)

  const recordsTotal = await R.pipeWith(R.andThen)([
    async () => knex.raw(`select count(*) from (${qb.toSQL().sql}) t`, qb.toSQL().bindings),
    R.prop('rows'),
    R.head,
    R.values,
    R.head,
    int,
  ])(true)

  const results = await qb
    .limit(getLimitFromQuery(query))
    .offset(getOffsetFromQuery(query))

  return {
    data: transformResults(results),
    meta: {
      recordsTotal,
      pagesTotal: Math.ceil(recordsTotal / getLimitFromQuery(query)),
      ...currentPageFromQuery(query),
    },
  }
}
