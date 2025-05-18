import * as R from 'ramda'
import { findOneOrFail as findSubchapter, deleteRecordCompletely, fixBookSubchapterOrderAfterDeleting } from '../book-subchapter-repository'
import { findOneOrFail as findChapter } from '../../book-chapters/book-chapter-repository'
import { update as patchContent } from '../../book-contents/book-content-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'

const nextItem = afterId => R.pipe(
  R.splitWhen(
    R.propEq('id', afterId)
  ),
  R.last,
  R.slice(1, Infinity),
  R.head
)

const sortByOrder = R.sortBy(
  R.prop('order')
)

const getSubchapters = R.pipe(
  R.prop('subchapters'),
  sortByOrder,
  R.filter(
    R.propEq('deleted_at', null)
  )
)

const getContents = R.pipe(
  R.prop('contents'),
  sortByOrder,
  R.filter(
    R.propEq('deleted_at', null)
  )
)

const getSourceSubchapterFromChapter = (subchapterId) => R.pipe(
  getSubchapters,
  nextItem(subchapterId)
)

const transferContents = async (sourceSubchapter, targetSubchapter) => {
  const contents = getContents(sourceSubchapter)

  return mapP(
    async content => patchContent(content.id, {
      subchapter_id: targetSubchapter.id,
      order: content.order + targetSubchapter.contents.length,
    })
  )(contents)
}

export default async (id: string) => {
  const targetSubchapter = await findSubchapter({ id }, ['contents'])
  const chapter = await findChapter({ id: targetSubchapter.chapter_id }, ['subchapters.contents'])
  const sourceSubchapter = getSourceSubchapterFromChapter(id)(chapter)

  if (!sourceSubchapter) {
    return targetSubchapter
  }

  await transferContents(sourceSubchapter, targetSubchapter)
  await deleteRecordCompletely(sourceSubchapter.id)
  await fixBookSubchapterOrderAfterDeleting(sourceSubchapter.chapter_id, sourceSubchapter.order)

  return targetSubchapter
}
