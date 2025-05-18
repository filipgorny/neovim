import BookConntentResourceDTO from './dto/book-content-resource-dto'
import models, { BookContentResource } from '../../models'
import { fetch } from '../../../utils/model/fetch'
import {
  _create,
  _delete,
  _patch,
  _findOneOrFail,
  _findOne,
  _deleteAll,
  fixOrderAfterDeleting,
  _countRecords
} from '../../../utils/generics/repository'

const MODEL = BookContentResource
const MODEL_NAME = 'BookContentResource'

export const create = async (dto: BookConntentResourceDTO, trx?) => (
  _create(MODEL)({
    ...dto,
  }, trx)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOne = async (where: {}, withRelated?: string[]) => (
  _findOne(MODEL)(where, withRelated)
)

export const find = async (where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
  }, withRelated, undefined, true)
)

export const fetchResourceCountFromBookContent = async (content_id, trx?) => (
  _countRecords(MODEL)({ content_id }, trx)
)

export const deleteResource = async (id: string, trx?) => (
  _delete(MODEL)({ id }, trx)
)

export const patch = async (id: string, data) => (
  _patch(MODEL)(id, data)
)

export const fixBookContentResourceOrderAfterDeleting = (trx?) => async (content_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_content_resources', 'content_id', trx)(content_id, order)
)
