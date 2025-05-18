import { BookContentImageDTO } from './dto/book-content-image-dto'
import models, { BookContentImage } from '../../models'
import {
  _create,
  _patch,
  _findOneOrFail,
  _delete,
  fixOrderAfterDeleting
} from '../../../utils/generics/repository'

const MODEL = BookContentImage
const MODEL_NAME = 'BookContentImage'

export const create = async (dto: BookContentImageDTO) => (
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

export const fixBookContentOrderAfterDeleting = async (content_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_content_images', 'content_id')(content_id, order)
)
