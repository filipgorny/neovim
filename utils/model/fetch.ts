import R from 'ramda'
import { throwException, notFoundException } from '../error/error-factory'
import { PAGINATION_DEFAULTS, buildQueryForPagination } from '../request/paginate'
import orm from '../../src/models'

interface BuildMetaForRawQueryLimit {
  take: number | string
  page: number | string
}

export interface StringLimit {
  take: string | number
  page: string | number
}

export interface Order {
  by: string
  dir: 'asc' | 'desc'
}

export interface FetchRawCommand {
  limit?: Partial<StringLimit>
  order?: Partial<Order>
}

export interface Pagination {
  page: number
  take: number
}

const { bookshelf } = orm

export const DISABLE_PAGINATION = true

export const paginate = R.pipe(
  R.when(
    R.isNil,
    R.always({})
  ),
  R.pick(['page', 'take']),
  R.mergeRight(PAGINATION_DEFAULTS)
)

const countPagesTotal = perPage => R.pipe(
  R.divide(R.__, perPage),
  Math.ceil
)

export const buildMeta = limit => R.pipe(
  R.applySpec({
    recordsTotal: R.identity,
    pagesTotal: countPagesTotal(limit.take),
  }),
  R.mergeRight(limit)
)

const buildMetaForRawQuery = (limit: BuildMetaForRawQueryLimit) => R.pipe(
  R.head,
  R.prop('count'),
  R.applySpec({
    page: () => parseInt(limit.page as string, 10),
    take: () => parseInt(limit.take as string, 10),
    recordsTotal: R.identity,
    pagesTotal: countPagesTotal(limit.take),
  })
)

const addOrdering = (query, order = {
  by: undefined,
  dir: undefined,
  nullsLast: false,
}) => (
  (order.by && order.dir)
    ? order.nullsLast ? query.orderByRaw(`${order.by} ${order.dir ?? 'asc'} NULLS LAST`) : query.orderBy(order.by, order.dir)
    : query
)

/**
 * Temporary disabled as I have no idea how to apply it in a generic way to all models
 */
// const excludeDeleted = R.mergeRight({ deleted_at: null })

export const fetch = Model => async (where: {} | string | Function, withRelated, {
  limit,
  order,
} = {
  limit: {},
  order: undefined,
}, disablePagination = false) => {
  try {
    const modelWhere = () => (
      typeof where === 'string' ? Model.whereRaw(where) : Model.where(where)
    )
    const recordsTotal = await modelWhere().count()
    const instances = await addOrdering(modelWhere(), order).fetchPage(
      buildQueryForPagination(withRelated, limit, disablePagination)
    )

    return {
      data: instances,
      meta: buildMeta(
        paginate(limit)
      )(recordsTotal),
    }
  } catch (e) {
    console.log(e)
    throwException(notFoundException(Model.prototype.tableName))
  }
}

export const fetchFirst = Model => async (where, withRelated = undefined) => {
  const collection = await fetch(Model)(where, withRelated)

  return R.pipe(
    R.prop('data'),
    R.invoker(0, 'toJSON'),
    R.head
  )(collection)
}

export const fetchCustom = query => async (withRelated, {
  limit,
  order,
} = {
  limit: { page: 1, take: 10 },
  order: undefined,
}, disablePagination = false, fetchConfig = {}, withStrictCount = false) => {
  try {
    let countQueryBuilder, recordsTotal

    if (withStrictCount) {
      countQueryBuilder = query.clone().query().clear('select').clear('order').clear('group') // if it's not cloned, it works badly
    } else {
      countQueryBuilder = R.clone(query) // if it's not cloned, it works badly
    }

    const instances = await addOrdering(query, order).fetchPage(
      buildQueryForPagination(withRelated, limit, disablePagination, fetchConfig)
    )

    if (withStrictCount) {
      const countResult = await countQueryBuilder.count('*')

      recordsTotal = R.pipe(
        R.head,
        R.prop('count')
      )(countResult)
    } else {
      recordsTotal = await countQueryBuilder.count(
        // { debug: true } // uncomment to enable debug
      ) // this *has* to be after fetchPage call, otherwise it may malform the results
    }

    console.log(recordsTotal)

    return {
      data: instances,
      meta: buildMeta(
        paginate(limit)
      )(recordsTotal),
    }
  } catch (e) {
    console.log(e)
    throwException(notFoundException('Custom fetch (fetchCustom) failed'))
  }
}

export const fetchRaw = (model, queryBuilderFunction, hydrateItem = R.identity) => async (command: FetchRawCommand = {}) => {
  try {
    const limit = {
      take: R.propOr('10', 'take')<Partial<StringLimit>, string>(command.limit),
      page: R.propOr('1', 'page')<Partial<StringLimit>, string>(command.limit),
    }

    const pagination = paginate(limit)
    let instances = []

    const recordsTotal = await queryBuilderFunction(bookshelf.knex, pagination, command.order, true)
    if (recordsTotal !== 0) instances = await queryBuilderFunction(bookshelf.knex, pagination, command.order)

    return {
      data: R.map(hydrateItem, instances),
      meta: buildMetaForRawQuery(
        paginate(limit)
      )(recordsTotal),
    }
  } catch (e) {
    console.log(e)
    throwException(notFoundException('Raw fetch (fetchRaw) failed'))
  }
}

export const fetchRawWithoutMeta = (model, queryBuilderFunction, hydrateItem = R.identity) =>
  async (command: FetchRawCommand = {}) => {
    try {
      const limit = {
        take: R.propOr('10', 'take')<Partial<StringLimit>, string>(command.limit),
        page: R.propOr('1', 'page')<Partial<StringLimit>, string>(command.limit),
      }

      const pagination = paginate(limit)
      const instances = await queryBuilderFunction(bookshelf.knex, pagination, command.order)

      return {
        data: R.map(hydrateItem, instances),
        meta: {},
      }
    } catch (e) {
      console.log(e)
      throwException(notFoundException('Raw fetch (fetchRawWithoutMeta) failed'))
    }
  }

export const fetchRawSimple = async (model, query, transformItem = R.identity) => {
  try {
    const instances = await query(bookshelf.knex)

    return transformItem(instances)
  } catch (e) {
    console.log(e)
    throwException(notFoundException('Raw fetch (fetchRawSimple) failed'))
  }
}
