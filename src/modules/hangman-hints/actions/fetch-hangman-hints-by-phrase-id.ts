
import * as R from 'ramda'
import { find } from '../hangman-hints-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

export default async (phrase_id: string) => (
  R.pipeWith(R.andThen)([
    async () => find({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { phrase_id }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)
