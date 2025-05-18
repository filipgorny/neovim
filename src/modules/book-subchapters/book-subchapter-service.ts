import mapP from '../../../utils/function/mapp'
import { deleteAllBookContentsFromSubchapter, deleteSoftDeletedBySubchapterIdCompletely } from '../book-contents/book-content-repository'
import * as R from 'ramda'
import { deleteBookContent, deleteBySubchapterId, ignoreNull, removeBookContentCompletely, restoreBookContent, restoreBySubchapterId as restoreBookContentsBySubchapterId } from '../book-contents/book-content-service'
import {
  create,
  update,
  findOneOrFail,
  remove,
  fixBookSubchapterOrderAfterDeleting,
  countSubchaptersWithinPart,
  fixPartsAfterDeleting,
  fixSubchapterOrderAfterAdding,
  deleteRecordCompletely,
  findOneOrFailWithDeleted,
  restore
} from './book-subchapter-repository'
import { makeDTO } from './dto/book-subchapter-dto'
import concatPath from '../../../utils/function/concatpath'

export const createSubchapter = async (title, order, chapter_id, part = 1, reorderSubchaptersFrom?) => {
  if (reorderSubchaptersFrom) {
    await fixSubchapterOrderAfterAdding(chapter_id, reorderSubchaptersFrom)
  }

  return create(
    makeDTO(title, order, chapter_id, part)
  )
}

export const updateSubchapter = (id: string) => async (dto: object) => (
  update(id, dto)
)

const fixBookSubchapterPartsAfterDeleting = async (chapter_id: string, part: number) => {
  const subchapterCount = await countSubchaptersWithinPart(part, chapter_id)

  if (Number(subchapterCount) === 0) {
    await fixPartsAfterDeleting(chapter_id, part)
  }
}

export const deleteSubchapter = (was_manually_deleted: boolean = true, parent_was_manually_deleted: boolean = false) => async (id: string) => {
  const subchapter = await findOneOrFail({ id }, ['contents'])

  const contentIds = concatPath(['contents'], ['id'])(subchapter)

  await mapP(
    deleteBookContent(was_manually_deleted, was_manually_deleted)
  )(contentIds)

  const result = await remove(id, was_manually_deleted)

  if (was_manually_deleted && !parent_was_manually_deleted) {
    await fixBookSubchapterOrderAfterDeleting(subchapter.chapter_id, subchapter.order)
    await fixBookSubchapterPartsAfterDeleting(subchapter.chapter_id, subchapter.part)
  }

  return result
}

export const restoreSubchapter = async (id: string) => { // after removing book
  const subchapter = await findOneOrFailWithDeleted({ id }, ['deletedNotManuallyBookContents'])

  const contentIds = concatPath(['deletedNotManuallyBookContents'], ['id'])(subchapter)

  await mapP(
    restoreBookContent
  )(contentIds)

  return restore(id)
}

const getAllContentIds = R.pipe(
  R.prop('allContents'),
  R.pluck('id')
)

export const deleteSubchapterCompletely = async (id: string) => {
  const subchapter = await findOneOrFailWithDeleted({ id }, ['allContents'])

  await Promise.all(
    R.pipe(
      getAllContentIds,
      R.map(removeBookContentCompletely)
    )(subchapter)
  )

  await deleteRecordCompletely(id)
}

export const setPartsById = (part: number, order, trx?) => async (id: string) => (
  update(id, { part, order }, trx)
)
