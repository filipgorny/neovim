import * as R from 'ramda'
import { ExamSectionScore as ExamSectionScoreModel } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import { ExamSectionScore, ExamSectionScoreDTO } from '../../types/exam-section-score'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = ExamSectionScoreModel
const MODEL_NAME = 'ExamSectionScore'

export const create = async (dto: ExamSectionScoreDTO): Promise<ExamSectionScore> => (
  _create(MODEL)(dto)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findBySectionId = async (sectionId: string) => (
  R.pipeWith(R.andThen)([
    async () => MODEL.where({ section_id: sectionId }).orderBy('score').fetchAll(),
    collectionToJson,
  ])(true)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteMany = async (where: {}) => (
  _delete(MODEL)(where)
)
