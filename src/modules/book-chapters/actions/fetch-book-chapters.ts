import R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../book-chapter-repository'

const defaultQuery = ({
  order: {
    by: 'order',
    dir: 'asc',
  },
  limit: {
    page: 1,
    take: 100,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

const findChapters = query => async book_id => (
  find(prepareQuery(query), { book_id }, ['subchapters', 'admins'])
)

const sortByPartDesc = R.sortWith([
  R.descend(R.prop('part')),
])

const appendNumberOfPartsToChapter = chapter => (
  R.pipe(
    R.prop('subchapters'),
    // @ts-ignore
    sortByPartDesc,
    R.head,
    R.propOr(0, 'part'),
    R.objOf('parts'),
    R.mergeRight(chapter)
    // @ts-ignore
  )(chapter)
)

export default async (book_id, query) => {
  const response = await findChapters(query)(book_id)

  const data = R.pipe(
    R.prop('data'),
    collectionToJson,
    R.map(
      appendNumberOfPartsToChapter
    )
  )(response)

  response.data = data

  return response
}
