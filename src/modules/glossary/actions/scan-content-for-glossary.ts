import R from 'ramda'
import XRegExp from 'xregexp'
import removeUnwantedRawText from '../../../../services/book-content/remove-unwanted-raw-text'
import { isString } from '../../../../utils/general/basic-type-check'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { scanContentForGlossary } from '../glossary-repository'
import { schema } from '../validation/schema/scan-content-for-glossary-schema'

const defaultQuery = ({
  order: {
    by: 'phrase_raw',
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

const stripNewLines = content => (
  isString(content) ? content.replace(/[\n\r]+/gi, ' ') : String(content)
)

const prepareWordsForSearch = R.pipe(
  R.prop('raw'),
  stripNewLines,
  removeUnwantedRawText,
  R.replace(/\s+/g, ' '),
  content => XRegExp.replace(content, XRegExp('\\p{P}', 'g'), ' '),
  R.split(' '),
  R.reject(R.isEmpty),
  R.map(R.trim)
)

export default async (query, payload) => {
  validateEntityPayload(schema)(payload)

  const words = prepareWordsForSearch(payload)
  const skipIds: string[] = payload.skipIds

  return scanContentForGlossary(prepareQuery(query), words, skipIds)
}
