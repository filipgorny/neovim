import * as R from 'ramda'

export const flattenAndDivideEventSchedule = R.pipe(
  R.pluck('tasks'),
  R.flatten,
  R.juxt([
    R.filter(
      R.propEq('type', 'exam')
    ),
    R.filter(
      R.propEq('type', 'task')
    ),
  ])
)
