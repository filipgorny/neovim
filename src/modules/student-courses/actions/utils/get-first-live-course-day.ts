import * as R from 'ramda'

export const getFirstLiveCourseDay = R.pipe(
  R.pathOr([], ['endDate', 'days']),
  R.sortBy(R.prop('class_date')),
  R.head,
  R.when(
    R.isNil,
    R.always(null)
  )
)
