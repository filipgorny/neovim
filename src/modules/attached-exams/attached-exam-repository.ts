import AttachedExamDTO from './dto/attached-exam-dto'
import { AttachedExam } from '../../models'
import {
  _deleteAll,
  _delete,
  _create,
  _findOne,
  _findOneOrFail,
  _patchWhere
} from '../../../utils/generics/repository'
import { AttachedExamType } from './attached-exam-types'

const MODEL = AttachedExam
const MODEL_NAME = 'AttachedExam'

export const create = async (dto: AttachedExamDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const removeAll = async (type: AttachedExamType, attached_id: string, excludeExamIds: string[]) => (
  MODEL.whereNotIn('exam_id', excludeExamIds).where({
    type,
    attached_id,
  }).destroy({ require: false })
)

export const removeExam = async (id: string) => (
  MODEL.where('exam_id', id).destroy({ require: false })
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const fetchAttachedExamCount = async (exam_id: string, ids: string[]) => (
  MODEL.whereIn('attached_id', ids)
    .where({ exam_id })
    .count()
)

export const fetchAttachedExams = async (ids: string[]) => (
  MODEL.whereIn('attached_id', ids).fetchAll()
)

export const detachManyByParent = async (attached_id: string, type: AttachedExamType) => (
  _delete(MODEL)({
    attached_id,
    type,
  })
)

export const patchWhere = async (where: object, dto: object) => (
  _patchWhere(MODEL)(where, dto)
)
