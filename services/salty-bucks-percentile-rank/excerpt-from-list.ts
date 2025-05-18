import * as R from 'ramda'

/**
 * Returns a portion of a list centered around the element with the given id (if possible).
 */
export const excerptFromList = (centerElementId: string) => (list: any[]) => {
  const elementPosition = R.findIndex(R.propEq('id', centerElementId))(list)

  return R.pipe(
    R.slice(Math.max(elementPosition - 4, 0), elementPosition + 10),
    R.take(10)
  )(list)
}
