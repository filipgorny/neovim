import R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../book-content-resource-repository'

export default async id => R.pipeWith(R.andThen)([
  async () => find({ content_id: id }, ['video']),
  R.prop('data'),
  collectionToJson,
  R.evolve({
    external_id: R.always(undefined),
  }),
])(true)
