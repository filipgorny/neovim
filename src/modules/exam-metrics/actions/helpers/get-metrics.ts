import * as R from 'ramda'

const findItemByOrder = item_order => R.pipe(
  R.find(
    R.propEq('order', item_order)
  ),
  R.omit(['order'])
)

const findMaxMetric = metricType => R.pipe(
  R.pluck('timers'),
  R.sortBy(
    R.prop(metricType)
  ),
  R.last,
  R.prop(metricType),
  R.objOf(`max_${metricType}`)
)

export const getMetrics = async (fetchFn, where, item_order) => (
  R.pipeWith(R.andThen)([
    fetchFn,
    R.prop('timings'),
    JSON.parse,
    R.juxt([
      findItemByOrder(item_order),
      findMaxMetric('working_avg'),
      findMaxMetric('checking_avg'),
      findMaxMetric('reading_avg'),
    ]),
    R.mergeAll,
  ])(where)
)
