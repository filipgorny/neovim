import R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../exam-intro-page-repository'

export default async (examTypeId: string) => R.pipeWith(R.andThen)([
  async () => find(
    { limit: {}, order: { by: 'order', dir: 'asc' } },
    { exam_type_id: examTypeId }
  ),
  R.prop('data'),
  collectionToJson,
  R.map(
    R.evolve({
      delta_object: JSON.parse,
    })
  ),
])(true)
