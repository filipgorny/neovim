import * as R from 'ramda'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { update } from '../../src/modules/book-content-questions/book-content-questions-repository'

const handleSingleSubchapter = async subchapter => {
  const subchapterQuestions = []

  const contents = R.pipe(
    R.prop('contents'),
    R.sortBy(R.prop('order'))
  )(subchapter)

  R.map(
    R.pipe(
      R.prop('questions'),
      R.sortBy(R.prop('order')),
      questions => subchapterQuestions.push(...questions)
    )
  )(contents)

  await R.addIndex(mapP)(
    async (question, index) => (
      update(question.id, { subchapter_order: index + 1 })
    )
  )(subchapterQuestions)
}

const handleSubChapters = async (subchapters) => (
  mapP(handleSingleSubchapter)(subchapters)
)

const handleChapters = async (chapters) => (
  mapP(
    async (chapter) => (
      handleSubChapters(chapter.subchapters)
    )
  )(chapters)
)

export const reorderQuestionsByBook = async (book) => (
  handleChapters(book.chapters)
)
