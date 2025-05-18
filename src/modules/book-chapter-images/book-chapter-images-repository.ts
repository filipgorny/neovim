import { BookChapterImageDTO } from './dto/book-chapter-image-dto'
import models, { BookChapterImage } from '../../models'
import {
  _create,
  _patch,
  _findOneOrFail,
  _delete,
  fixOrderAfterDeleting
} from '../../../utils/generics/repository'

const MODEL = BookChapterImage
const MODEL_NAME = 'BookChapterImage'

export const create = async (dto: BookChapterImageDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const remove = async id => (
  _delete(MODEL)({ id })
)

export const removeWhere = async (where) => (
  _delete(MODEL)(where)
)

export const fixBookContentOrderAfterDeleting = async (chapter_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_chapter_images', 'chapter_id')(chapter_id, order)
)
