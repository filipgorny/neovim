import * as R from 'ramda'
import moment from 'moment'
import { int } from '@desmart/js-utils'
import { findOneOrFail as findChapter } from '../book-chapter-repository'
import { findOneOrFail as findBook } from '../../books/book-repository'
import { updateSubchapter } from '../../book-subchapters/book-subchapter-service'
import { createChapter, updateChapter } from '../book-chapter-service'
import { DATE_FORMAT_YMD } from '../../../constants'

const sortByOrder = R.sortBy(
  R.prop('order')
)

const getSubchapters = R.pipe(
  R.prop('subchapters'),
  sortByOrder
)

const getChapters = R.pipe(
  R.prop('chapters'),
  sortByOrder
)

const getItemsToMove = afterId => R.pipe(
  R.splitWhen(
    R.propEq('id', afterId)
  ),
  R.last,
  R.slice(1, Infinity)
)

const moveSubchapters = (targetChapterId, partDistance) => async subchapters => (
  Promise.all(
    R.addIndex(R.map)(
      async (subchapter, index) => updateSubchapter(subchapter.id)({
        chapter_id: targetChapterId,
        order: index + 1,
        part: int(subchapter.part) - partDistance,
      })
    )(subchapters)
  )
)

const moveChapters = async chapters => (
  Promise.all(
    R.addIndex(R.map)(
      async (chapter, index) => updateChapter(chapter.id)({
        order: chapter.order + 1,
      })
    )(chapters)
  )
)

const getSubchapterPartDistance = R.pipe(
  R.head,
  R.prop('part'),
  int,
  R.subtract(R.__, 1)
)

export default async (chapter_id, subchapter_id) => {
  const chapter = await findChapter({ id: chapter_id }, ['subchapters'])
  const book = await findBook({ id: chapter.book_id }, ['chapters'])

  const subchaptersToMove = R.pipe(
    getSubchapters,
    getItemsToMove(subchapter_id)
  )(chapter)

  const chaptersToMove = R.pipe(
    getChapters,
    getItemsToMove(chapter_id)
  )(book)

  await moveChapters(chaptersToMove)

  const newChapter = await createChapter(`Extracted chapter ${moment().format(DATE_FORMAT_YMD)}`, chapter.order + 1, chapter.book_id)

  const partDistance = getSubchapterPartDistance(subchaptersToMove)

  await moveSubchapters(newChapter.id, partDistance)(subchaptersToMove)

  return newChapter
}
