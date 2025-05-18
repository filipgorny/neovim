import * as R from 'ramda'
import { find as findGlossaryEntries } from '../../glossary/glossary-repository'
import { find as findFlashcards } from '../../flashcards/flashcard-repository'
import { find as findBookContents } from '../../book-contents/book-content-repository'

type QueryPartial = {
  limit: {
    take: number,
    page: number,
  }
}

const buildPrefixedLinks = (table, column) => R.pipe(
  R.pluck('id'),
  R.map(
    R.concat(table + '/' + column + '/')
  )
)

const buildGlossaryLinks = async (column: string, query: QueryPartial) => {
  const records = await findGlossaryEntries({ limit: query.limit, order: { by: 'phrase_raw', dir: 'asc' } })

  return R.pipe(
    R.prop('data'),
    buildPrefixedLinks('glossary', column)
  )(records)
}

const buildFlashcardLinks = async (column: string, query: QueryPartial) => {
  const records = await findFlashcards({ limit: query.limit, order: { by: 'created_at', dir: 'asc' } })

  return R.pipe(
    R.prop('data'),
    buildPrefixedLinks('flashcards', column)
  )(records)
}

const buildBookContentLinks = async (column: string, query: QueryPartial) => {
  const records = await findBookContents({ limit: query.limit, order: { by: 'created_at', dir: 'asc' } })

  return R.pipe(
    R.prop('data'),
    buildPrefixedLinks('book_contents', column)
  )(records)
}

const buildLinks = {
  glossary: buildGlossaryLinks,
  flashcards: buildFlashcardLinks,
  book_contents: buildBookContentLinks,
}

export default async (table: string, column: string, query: QueryPartial) => {
  return buildLinks[table](column, query)
}
