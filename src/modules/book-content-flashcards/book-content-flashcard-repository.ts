import { BookContentFlashcardReal } from '../../models'
import {
  _create,
  _delete,
  _findOne,
  _patch,
  _patchWhere
} from '../../../utils/generics/repository'

const MODEL = BookContentFlashcardReal

export const create = async (dto: {}) => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}, withRelated?: string[]) => (
  _findOne(MODEL)(where, withRelated)
)

export const removeWhere = async (where) => (
  _delete(MODEL)(where)
)

export const patchWhere = async (where: {}, data: {}) => (
  _patchWhere(MODEL)(where, data)
)
