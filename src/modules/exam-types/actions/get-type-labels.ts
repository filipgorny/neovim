import * as R from 'ramda'
import { getTypeLabels } from '../exam-type-repository'

export default async () => (
  R.pipeWith(R.andThen)([
    getTypeLabels,
    R.pluck('type_label'),
  ])(true)
)
