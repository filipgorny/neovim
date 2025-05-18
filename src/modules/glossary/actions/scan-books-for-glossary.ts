import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { findOneOrFail, scanBooksForGlossary } from '../glossary-repository'
import { schema } from '../validation/schema/scan-books-for-glossary-schema'

const defaultQuery = ({
  order: {
    by: 'book_title',
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

export default async (id, query) => {
  validateEntityPayload(schema)(query)

  const glossary = await findOneOrFail({ id })

  return scanBooksForGlossary(prepareQuery(query), glossary.phrase_raw, glossary.id)
}
