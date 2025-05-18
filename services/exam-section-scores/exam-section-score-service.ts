import * as R from 'ramda'

const fakeItem = { percentile_rank: 0 }

const float = num => parseFloat(num).toFixed(2)

/**
 * Normal subtraction of floats gives horrible rounding
 */
const preciseDifference = (a, b) => (
  // @ts-ignore
  float(float(a) - float(b))
)

const getPreviousItem = (items, index) => (
  R.ifElse(
    R.equals(0),
    R.always(fakeItem),
    R.always(items[index - 1])
  )(index)
)

const calculatePercentage = (item, items, index) => (
  preciseDifference(
    item.percentile_rank,
    getPreviousItem(items, index).percentile_rank
  )
)

/**
 * Having percentile rank of individual items we can calculate the percentage value of each item
 * by simply calculating the difference between the current and previous item
 * (for the first item in the collection the previous value is equal to zero)
 */
const calculatePercentageForNormalDistribution = items => (item, index) => (
  {
    ...item,
    percentage: calculatePercentage(item, items, index),
  }
)

export const calculateDifferences = data => (
  R.addIndex(R.map)(
    calculatePercentageForNormalDistribution(data)
  )(data)
)
