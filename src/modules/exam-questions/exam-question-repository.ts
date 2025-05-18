import orm, { ExamQuestion } from '../../models'
import ExamQuestionDto from './dto/exam-question-dto'
import { _create, _findOneOrFail, _patch, _patchRawCustom } from '../../../utils/generics/repository'

const MODEL = ExamQuestion
const MODEL_NAME = 'ExamQuestion'

const knex = orm.bookshelf.knex

export const create = async (dto: ExamQuestionDto) => (
  _create(MODEL)(dto)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const updateQuestionsBulk = (questions: Array<{id: string}>, trx) => (
  _patchRawCustom(knex, 'exam_questions', trx)(questions)
)
