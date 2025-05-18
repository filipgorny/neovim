import R from 'ramda'
import renameProps from '../object/rename-props'

export const PAGINATION_DEFAULTS = {
  page: 1,
  take: 10,
}

export const paginate = (limit, disablePagination = false) => {
  if (disablePagination) {
    return {
      page: 1,
      pageSize: 100000,
    }
  }

  return R.pipe(
    R.when(
      R.isNil,
      R.always({})
    ),
    R.pick(['page', 'take']),
    R.mergeRight(PAGINATION_DEFAULTS),
    renameProps({ take: 'pageSize' })
  )(limit)
}

const addRelationClause = withRelated => (
  R.unless(
    R.isNil,
    R.objOf('withRelated')
  )(withRelated)
)

export const buildQueryForPagination = (withRelated, limit, disablePagination, fetchConfig = {}) => ({
  ...addRelationClause(withRelated),
  ...paginate(limit, disablePagination),
  ...fetchConfig,
  // ...{ debug: true }, // uncomment to enable debug
})
