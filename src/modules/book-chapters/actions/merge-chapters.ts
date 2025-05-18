import * as R from 'ramda'
import { findOneOrFail as findChapter, deleteRecordCompletely, fixChapterOrderAfterDeleting } from '../book-chapter-repository'
import { findOneOrFail as findBook } from '../../books/book-repository'
import { update as patchSubchapter } from '../../book-subchapters/book-subchapter-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { removeChapterImageByChapterId } from '../../book-chapter-images/book-chapter-images-service'

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

const getChapters = R.pipe(
  R.prop('chapters'),
  sortByOrder
)

const getSubchapters = R.pipe(
  R.prop('subchapters'),
  sortByOrder,
  R.filter(
    R.propEq('deleted_at', null)
  )
)

const getSourceChapterFromBook = (chapterId) => R.pipe(
  getChapters,
  nextItem(chapterId)
)

const transferSubchapters = async (sourceChapter, targetChapter) => {
  const subchapters = getSubchapters(sourceChapter)
  const targetSubchapters = getSubchapters(targetChapter)
  const lastSubchapter = R.last(targetSubchapters)

  return mapP(
    async subchapter => patchSubchapter(subchapter.id, {
      chapter_id: targetChapter.id,
      order: subchapter.order + targetChapter.subchapters.length,
      part: lastSubchapter.part + subchapter.part,
    })
  )(subchapters)
}

export default async (id: string) => {
  const targetChapter = await findChapter({ id }, ['subchapters'])
  const book = await findBook({ id: targetChapter.book_id }, ['chapters.subchapters'])
  const sourceChapter = getSourceChapterFromBook(id)(book)

  if (!sourceChapter) {
    return targetChapter
  }

  await transferSubchapters(sourceChapter, targetChapter)
  await removeChapterImageByChapterId(sourceChapter.id)
  await deleteRecordCompletely(sourceChapter.id)
  await fixChapterOrderAfterDeleting(sourceChapter.book_id, sourceChapter.order)

  return targetChapter
}
