import mapP from '../../../utils/function/mapp'
import { ChapterAdmin } from '../../types/chapter-admin'
import { create, deleteRecord, deleteWhere } from './chapter-admins-repository'

export const attachAdminsToBookChapter = async (data: ChapterAdmin[]) => (
  mapP(create)(data)
)

export const detachAdminsFromBookChapter = async (data: ChapterAdmin[]) => (
  mapP(deleteRecord)(data)
)

export const detachByBookChapterId = async (chapter_id: string) => (
  deleteWhere({ chapter_id })
)
