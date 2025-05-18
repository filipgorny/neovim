import * as R from 'ramda'

export const sortByOrder = R.sortBy(R.prop('order'))

export const getSectionByOrder = order => R.find(
  R.propEq('order', parseInt(order, 10))
)
