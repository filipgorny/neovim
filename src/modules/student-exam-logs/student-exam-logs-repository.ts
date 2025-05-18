import { StudentExamLog } from '../../models'
import { _create, _delete } from '../../../utils/generics/repository'
import StudentExamLogDTO from './dto/student-exam-log-dto'
import { fetch } from '../../../utils/model/fetch'
import R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = StudentExamLog

export const create = async (dto: StudentExamLogDTO) => (
  _create(MODEL)(dto)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const deleteLogsByStudentExamId = async (exam_id: string) => (
  _delete(MODEL)({ exam_id })
)

export const fetchLastExamLogWithType = async (exam_id, type) => R.pipeWith(R.andThen)([
  async () => fetch(MODEL)({
    exam_id,
    type,
  }, [], { limit: { page: 1, take: 1 }, order: { dir: 'desc', by: 'created_at' } }),
  R.prop('data'),
  collectionToJson,
  R.head,
])(true)
