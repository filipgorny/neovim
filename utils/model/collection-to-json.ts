import R from 'ramda'

export const collectionToJson = R.map(R.invoker(0, 'toJSON'))
