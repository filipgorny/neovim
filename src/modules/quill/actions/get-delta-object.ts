import * as R from 'ramda'
import { findOneOrFail as findGlossaryEntry } from '../../glossary/glossary-repository'
import { findOneOrFail as findFlashcard } from '../../flashcards/flashcard-repository'
import { findOneOrFail as findBookContent } from '../../book-contents/book-content-repository'

const getGlossaryDeltaObject = async (column: string, id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findGlossaryEntry({ id }),
    R.prop(column),
  ])(id)
)

const getFlashcardDeltaObject = async (column: string, id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findFlashcard({ id }),
    R.prop(column),
  ])(id)
)

const getBookContentDeltaObject = async (column: string, id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findBookContent({ id }),
    R.prop(column),
  ])(id)
)

const getDeltaObject = {
  glossary: getGlossaryDeltaObject,
  flashcards: getFlashcardDeltaObject,
  book_contents: getBookContentDeltaObject,
}

export default async (table: string, column: string, id: string) => (
  getDeltaObject[table](column, id)
)
