import * as R from 'ramda'
import moment from 'moment'
import { findOneOrFail as findSubchapter } from '../book-subchapter-repository'
import { findOneOrFail as findChapter } from '../../book-chapters/book-chapter-repository'
import { patchBookContent } from '../../book-contents/book-content-service'
import { createSubchapter } from '../book-subchapter-service'
import { updateSubchapter } from '../../book-subchapters/book-subchapter-service'
import { DATE_FORMAT_YMD } from '../../../constants'

const sortByOrder = R.sortBy(
  R.prop('order')
)

const getBookContents = R.pipe(
  R.prop('contents'),
  sortByOrder
)

const moveBookContents = (targetSubchapterId) => async bookContents => (
  Promise.all(
    R.addIndex(R.map)(
      async (bookContent, index) => patchBookContent(bookContent.id)({
        subchapter_id: targetSubchapterId,
        order: index + 1,
      })
    )(bookContents)
  )
)

const getSubchapters = R.pipe(
  R.prop('subchapters'),
  sortByOrder
)

const getItemsToMoveAfter = afterId => R.pipe(
  R.splitWhen(
    R.propEq('id', afterId)
  ),
  R.last,
  R.slice(1, Infinity)
)

const getItemsToMoveStartingFrom = afterId => R.pipe(
  R.splitWhen(
    R.propEq('id', afterId)
  ),
  R.last
)

const moveSubchapters = async subchapters => (
  Promise.all(
    R.addIndex(R.map)(
      async (subchapter, index) => updateSubchapter(subchapter.id)({
        order: subchapter.order + 1,
      })
    )(subchapters)
  )
)

export default async (subchapter_id: string, content_id: string) => {
  const subchapter = await findSubchapter({ id: subchapter_id }, ['contents'])
  const chapter = await findChapter({ id: subchapter.chapter_id }, ['subchapters'])

  const bookContentsToMove = R.pipe(
    getBookContents,
    getItemsToMoveStartingFrom(content_id)
  )(subchapter)

  const subchaptersToMove = R.pipe(
    getSubchapters,
    getItemsToMoveAfter(subchapter_id)
  )(chapter)

  await moveSubchapters(subchaptersToMove)

  const newSubchapter = await createSubchapter(`Extracted section ${moment().format(DATE_FORMAT_YMD)}`, subchapter.order + 1, subchapter.chapter_id, subchapter.part)

  await moveBookContents(newSubchapter.id)(bookContentsToMove)

  return newSubchapter
}
