import ExamPassageDto from './dto/exam-passage-dto'
import { _create, _patch, _findOneOrFail, _patchRawCustom } from '../../../utils/generics/repository'
import orm, { ExamPassage } from '../../models'

const MODEL = ExamPassage
const MODEL_NAME = 'ExamPassage'

const knex = orm.bookshelf.knex

export const create = async (dto: ExamPassageDto) => (
  _create(MODEL)(dto)
)

export const patch = async (id: string, data: {}) => (
  _patch(MODEL)(id, data)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const updatePassagesBulk = (passages: Array<{id: string, content?: string}>, trx) => (
  _patchRawCustom(knex, 'exam_passages', trx)(passages)
)
