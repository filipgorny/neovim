import { StudentExamQuestion } from '../../models'
import StudentExamQuestionDto from './dto/student-exam-question-dto'
import { _create, _deleteAll, _findOneOrFail, _patch } from '../../../utils/generics/repository'

const MODEL = StudentExamQuestion
const MODEL_NAME = 'StudentExamQuestion'

export const create = async (dto: StudentExamQuestionDto) => (
  _create(MODEL)(dto)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const patch = async (id: string, data: {}) => (
  _patch(MODEL)(id, data)
)

export const dropQuestionsWithIds = async (ids: string[]) => (
  _deleteAll(MODEL)(ids)
)
