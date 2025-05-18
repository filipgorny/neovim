import * as R from 'ramda'

const calculatePropAvg = propName => R.pipe(
  R.juxt([
    R.prop(propName),
    R.always(1)
  ]),
  // @ts-ignore
  R.apply(R.divide),
  Math.round
)

const setAvgValues = R.applySpec({
  checking_sum: R.prop('checking'),
  checking_divisor: R.always(1),
  checking_avg: calculatePropAvg('checking'),
  reading_sum: R.prop('reading'),
  reading_divisor: R.always(1),
  reading_avg: calculatePropAvg('reading'),
  working_sum: R.prop('working'),
  working_divisor: R.always(1),
  working_avg: calculatePropAvg('working')
})

export const calculateAvgValues = resourceType => R.map(
  // @ts-ignore
  R.over(
    // @ts-ignore
    R.lensProp(resourceType),
    // @ts-ignore
    R.map(
      // @ts-ignore
      R.over(R.lensProp('timers'), setAvgValues)
    )
  )
)
