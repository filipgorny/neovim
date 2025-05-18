import * as R from 'ramda'
import { findOneOrFail } from '../exam-repository'

const hydrateItem = R.evolve({
  exam_length: JSON.parse,
})

export default async (id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findOneOrFail({ id }, ['sections']),
    hydrateItem,
  ])(id)
)
