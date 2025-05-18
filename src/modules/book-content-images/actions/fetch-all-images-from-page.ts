import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { findAllSubchaptersWithinPart } from '../../book-subchapters/book-subchapter-repository'

export default async (chapter_id, part) => R.pipeWith(R.andThen)([
  async () => findAllSubchaptersWithinPart(part, chapter_id, ['contents.images']),
  R.prop('data'),
  collectionToJson,
  R.pluck('contents'),
  R.flatten,
  R.pluck('images'),
  R.flatten,
  R.sortBy(R.prop('order')),
  R.map(
    R.evolve({
      image: generateStaticUrl,
      small_ver: generateStaticUrl,
    })
  ),
])(true)
