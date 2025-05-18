import { StudentExamPassage } from '../../models'
import StudentExamPassageDto from './dto/student-exam-passage-dto'
import { _create, _deleteAll, _findOneOrFail, _patch } from '../../../utils/generics/repository'

const MODEL = StudentExamPassage
const MODEL_NAME = 'StudentExamPassage'

export const create = async (dto: StudentExamPassageDto) => (
  _create(MODEL)(dto)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const patch = async (id: string, data: {}) => (
  _patch(MODEL)(id, data)
)

export const dropPassagesWithIds = async (ids: string[]) => (
  _deleteAll(MODEL)(ids)
)
