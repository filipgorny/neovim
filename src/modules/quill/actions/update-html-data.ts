import { patchGlossaryRecord } from '../../glossary/glossary-service'
import { patch as patchFlashcard } from '../../flashcards/flashcard-repository'
import { patch as patchBookContent } from '../../book-contents/book-content-repository'

type Payload = {
  table: string,
  column: string,
  html: string,
}

const updateGlossaryHtml = async (id: string, column: string, html: string) => (
  patchGlossaryRecord(id, {
    [column]: html,
  })
)

const updateFlashcardHtml = async (id: string, column: string, html: string) => (
  patchFlashcard(id, {
    [column]: html,
  })
)

const updateBookContentHtml = async (id: string, column: string, html: string) => (
  patchBookContent(id, {
    [column]: html,
  })
)

const updateHtml = {
  glossary: updateGlossaryHtml,
  flashcards: updateFlashcardHtml,
  book_contents: updateBookContentHtml,
}

export default async (id: string, payload: Payload) => (
  updateHtml[payload.table](id, payload.column, payload.html)
)
