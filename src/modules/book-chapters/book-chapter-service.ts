import * as R from 'ramda'
import mapP from '../../../utils/function/mapp'
import { int } from '../../../utils/number/int'
import randomString from '../../../utils/string/random-string'
import { removeChapterImageByChapterId } from '../book-chapter-images/book-chapter-images-service'
import { cretateBookContentsFromOriginalContents } from '../book-contents/book-content-service'
import { fixPartsAfterDeleting } from '../book-subchapters/book-subchapter-repository'
import { createSubchapter, deleteSubchapter, deleteSubchapterCompletely, restoreSubchapter, updateSubchapter } from '../book-subchapters/book-subchapter-service'
import { detachByBookChapterId } from '../chapter-admins/chapter-admins-service'
import { create, update, findOneOrFail, remove, fixChapterOrderAfterDeleting, fixChapterOrderAfterAdding, deleteRecordCompletely, findOneOrFailWithDeleted, getSoftDeletedSubchapterIds, restore } from './book-chapter-repository'
import { makeDTO } from './dto/book-chapter-dto'
import forEachP from '../../../utils/function/foreachp'

export const createChapter = async (title, order, book_id, reorderChaptersFrom?, image_tab_title?) => {
  if (reorderChaptersFrom) {
    await fixChapterOrderAfterAdding(book_id, reorderChaptersFrom)
  }

  return create(
    makeDTO(title, order, book_id, image_tab_title)
  )
}

export const updateChapter = (id: string) => async (dto: {}) => (
  update(id, dto)
)

export const updateChapterOrder = async (id: string, order) => (
  update(id, {
    order,
  })
)

const getSubchapterIds = R.pipe(
  R.prop('subchapters'),
  R.pluck('id')
)

export const deleteChapter = (was_manually_deleted: boolean = true, parent_was_manually_deleted: boolean = false) => async (id: string) => {
  const chapter = await findOneOrFail({ id }, ['subchapters'])
  const result = await remove(id, was_manually_deleted)

  if (was_manually_deleted && !parent_was_manually_deleted) {
    await fixChapterOrderAfterDeleting(chapter.book_id, chapter.order)
  }

  await detachByBookChapterId(id)

  const subchapterIds = getSubchapterIds(chapter)

  await forEachP(
    deleteSubchapter(was_manually_deleted, was_manually_deleted)
  )(subchapterIds)

  return result
}

export const restoreChapter = async (id: string) => { // after removing book
  const chapter = await findOneOrFailWithDeleted({ id }, ['deletedNotManuallySubchapters'])

  await R.pipe(
    R.prop('deletedNotManuallySubchapters'),
    R.pluck('id'),
    R.map(restoreSubchapter)
  )(chapter)

  return restore(id)
}

const getAllSubchapterIds = R.pipe(
  R.prop('allSubchapters'),
  R.pluck('id')
)

export const deleteChapterCompletely = async (id: string) => {
  const chapter = await findOneOrFailWithDeleted({ id }, ['allSubchapters'])

  await detachByBookChapterId(id)

  await forEachP(
    deleteSubchapterCompletely
  )(getAllSubchapterIds(chapter))

  await removeChapterImageByChapterId(id)

  await deleteRecordCompletely(id)
}

const filterSubchaptersByPart = part => R.filter(
  R.propEq('part', part)
)

export const deletePart = async (id: string, part: string) => {
  const chapter = await findOneOrFail({ id }, ['subchapters'])

  await fixPartsAfterDeleting(id, int(part) + 1)

  return R.pipe(
    R.prop('subchapters'),
    filterSubchaptersByPart(
      int(part)
    ),
    R.pluck('id'),
    R.map(deleteSubchapter(true, false))
  )(chapter)
}

/**
 * Fixes a chapter's subchapter ordering so they are consecutive numbers.
 */
export const fixSubchapterOrdering = async (id: string) => {
  const chapter = await findOneOrFail({ id }, ['subchapters'])

  const subchapters = R.pipe(
    R.prop('subchapters'),
    R.sortBy(
      R.prop('order')
    )
  )(chapter)

  return R.addIndex(R.map)(
    async (item, index) => (
      updateSubchapter(item.id)({ order: index + 1 })
    )
  )(subchapters)
}

export const cretateBookSubhaptersFromOriginalSubchapters = (chapterId) => async originalSubchapter => {
  const subchapter = await R.pipe(
    R.juxt([
      R.prop('title'),
      R.prop('order'),
      R.always(chapterId),
      R.prop('part'),
    ]),
    R.apply(createSubchapter)
  )(originalSubchapter)

  const originalContents = R.prop('contents')(originalSubchapter)

  await mapP(
    cretateBookContentsFromOriginalContents(subchapter.id)
  )(originalContents)

  return subchapter
}
